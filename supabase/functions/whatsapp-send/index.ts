import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const supabase = createClient(
  Deno.env.get("SUPABASE_URL") ?? "",
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
);

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Authenticate the request — the frontend sends the user's JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.slice('Bearer '.length).trim();
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { conversationId, content } = body;
    const normalizedContent = typeof content === 'string' ? content.trim() : '';


    if (!conversationId || typeof content !== 'string' || !content.trim() || content.trim().length > 4096) {
      return new Response(JSON.stringify({ error: "Missing conversationId or content" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the conversation and verify the user is a business member
    const { data: conversation, error: convoError } = await supabase
      .from("conversations")
      .select("id, business_id, customer_phone, customer_name")
      .eq("id", conversationId)
      .maybeSingle();

    if (convoError || !conversation) {
      return new Response(JSON.stringify({ error: "Conversation not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Verify the user is a member of this business
    const { data: membership } = await supabase
      .from("business_memberships")
      .select("id")
      .eq("business_id", conversation.business_id)
      .eq("user_id", user.id)
      .maybeSingle();

    if (!membership) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the business WhatsApp configuration
    const { data: business } = await supabase
      .from("businesses")
      .select("whatsapp_phone_number_id, whatsapp_business_name")
      .eq("id", conversation.business_id)
      .maybeSingle();

    if (!business?.whatsapp_phone_number_id) {
      return new Response(JSON.stringify({ error: "WhatsApp is not connected. Connect WhatsApp in Settings first." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the WhatsApp access token from edge function secrets
    const accessToken = Deno.env.get("WHATSAPP_ACCESS_TOKEN");
    if (!accessToken) {
      return new Response(JSON.stringify({ error: "WhatsApp access token not configured. Add WHATSAPP_ACCESS_TOKEN as an edge function secret." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send the message via Meta's WhatsApp Cloud API
    const phoneNumberId = business.whatsapp_phone_number_id;
    const recipientPhone = conversation.customer_phone?.replace(/^\+/, '');

    if (!recipientPhone) {
      return new Response(JSON.stringify({ error: "No customer phone number on this conversation" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const metaResponse = await fetch(
      `https://graph.facebook.com/v26.0/${phoneNumberId}/messages`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messaging_product: "whatsapp",
          recipient_type: "individual",
          to: recipientPhone,
          type: "text",
          text: {
            body: normalizedContent,
          },
        }),
      },
    );

    const metaData = await metaResponse.json();

    if (!metaResponse.ok) {
      // Save the message with failed status
      await supabase.from("messages").insert({
        conversation_id: conversationId,
        business_id: conversation.business_id,
        direction: "outgoing",
        channel: 'whatsapp',
        content: normalizedContent,
        status: "failed",
        error_code: metaData?.error?.code?.toString() ?? "unknown",
        error_message: metaData?.error?.message ?? "Meta API returned an error",
      });

      return new Response(JSON.stringify({
        error: "Failed to send WhatsApp message",
        details: metaData?.error?.message ?? "Unknown Meta API error",
      }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Success — save the message with Meta's message ID
    const waMessageId = metaData?.messages?.[0]?.id;
    await supabase.from("messages").insert({
      conversation_id: conversationId,
      business_id: conversation.business_id,
      direction: "outgoing",
      channel: 'whatsapp',
      content: normalizedContent,
      wa_message_id: waMessageId ?? null,
      status: "sent",
    });

    // Update conversation preview
    await supabase
      .from("conversations")
      .update({
        last_message_preview: normalizedContent,
        last_message_at: new Date().toISOString(),
      })
      .eq("id", conversationId);

    return new Response(JSON.stringify({
      success: true,
      wa_message_id: waMessageId,
    }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Send error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
