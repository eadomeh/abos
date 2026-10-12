import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") ?? "";
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const INTERNAL_KEY = Deno.env.get("ABOS_INTERNAL_KEY") ?? "";
const EVAL_KEY = Deno.env.get("ABOS_EVAL_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SERVICE_ROLE);
const AGENT_URL = SUPABASE_URL + "/functions/v1/abos-ai-agent";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {"content-type":"application/json","cache-control":"no-store"},
  });
}

function norm(v: unknown) {
  return String(v ?? "").toLowerCase().trim().replace(/[_-]+/g," ");
}

function languageMatch(expected: string, actual: string) {
  const e = norm(expected);
  const a = norm(actual);
  if (e === a) return true;
  if (e.includes("mixed") && a.includes("mixed")) return true;
  if (e === "pcm ng" && a.includes("pcm")) return true;
  if (e === "en ng" && (a === "en" || a.includes("en ng"))) return true;
  return false;
}

const intentAliases: Record<string,string[]> = {
  product_pricing:["product pricing","pricing"],
  product_availability:["product availability","availability"],
  product_discovery:["product discovery"],
  order_status:["order status"],
  business_location:["business location","location","business info"],
  delivery_inquiry:["delivery inquiry","delivery"],
  purchase_consideration:["purchase consideration","follow up","followup"],
  price_negotiation:["price negotiation","negotiation"],
  payment_intent:["payment intent","payment"],
  return_policy:["return policy","returns"],
  complaint:["complaint","support"],
  greeting:["greeting","small talk"],
  small_talk:["small talk","greeting"],
  bulk_purchase:["bulk purchase","bulk order"],
};

function intentMatch(expected: string, actual: string) {
  const e = norm(expected);
  const a = norm(actual);
  if (e === a) return true;
  return (intentAliases[e] ?? [e]).some((x) => a === x || a.includes(x));
}

function entitySubset(expected: Record<string,unknown>, actual: Record<string,unknown>) {
  for (const [k,v] of Object.entries(expected ?? {})) {
    const av = actual?.[k];
    if (typeof v === "number") {
      if (Number(av) !== Number(v)) return false;
    } else if (typeof v === "boolean") {
      if (Boolean(av) !== v) return false;
    } else {
      const ev = norm(v);
      const aa = norm(av);
      if (!aa.includes(ev) && !(ev.includes("mixed") && aa.includes("mixed"))) return false;
    }
  }
  return true;
}

function actionMatch(expectedAction: string, calls: any[], answer: string) {
  const names = calls.map((x)=>String(x?.name ?? ""));
  switch (expectedAction) {
    case "reply_only":
      return !names.some((n)=>["search_products","search_business_knowledge","get_order","get_customer_orders","create_lead","update_lead","create_task","create_note"].includes(n));
    case "search_products":
      return names.includes("search_products");
    case "business_policy_lookup":
      return names.includes("search_business_knowledge");
    case "get_order":
      return names.includes("get_order") || names.includes("get_customer_orders");
    case "lead_signal":
      return names.includes("create_lead") || names.includes("update_lead");
    case "create_follow_up_task":
      return names.includes("create_task");
    case "human_review_or_support":
      return names.includes("create_task") || /human|support|team|review/i.test(answer);
    case "customer_lookup":
      return names.includes("find_customer") ||
        names.includes("get_customer_orders") ||
        names.includes("get_order");
    case "refuse_internal_disclosure":
      return !names.some((n)=>[
        "find_customer","get_customer_orders","get_order",
        "create_lead","update_lead","create_task","create_note"
      ].includes(n)) &&
        /cannot|can't|don't have access|not able|internal|system prompt/i.test(answer);
    case "business_info":
      return names.includes("search_business_knowledge") || /located|location|lagos|abuja|address/i.test(answer);
    default:
      return true;
  }
}

async function createFixture(ownerId:string) {
  const {data: business, error: be} = await supabase.from("businesses").insert({
    name:"ABOS AI Evaluation Lab V1.3",
    description:"Temporary automated evaluation fixture. Safe test data.",
    category:"test",
    owner_id:ownerId,
    owner_name:"ABOS Eval",
    country:"Nigeria",
    currency:"NGN",
    setup_complete:true
  }).select("id").single();
  if (be) throw be;
  const bid = business.id;
  try {

    const {data: products, error: pe} = await supabase.from("products").insert([
      {business_id:bid,name:"Black Sneakers",description:"Black everyday sneakers, sizes 40-45.",price:45000,currency:"NGN",stock_quantity:8,sku:"EVAL-BLACK-01",category:"Footwear",is_active:true},
      {business_id:bid,name:"Blue Sneakers",description:"Blue running sneakers, sizes 41-44.",price:38000,currency:"NGN",stock_quantity:3,sku:"EVAL-BLUE-01",category:"Footwear",is_active:true},
      {business_id:bid,name:"White Shirt",description:"Classic white shirt, sizes S-XL.",price:12000,currency:"NGN",stock_quantity:15,sku:"EVAL-WHITE-01",category:"Shirts",is_active:true}
    ]).select("id,name");
    if (pe) throw pe;

    const {error: ke} = await supabase.from("business_knowledge").insert([
      {business_id:bid,title:"Delivery",content:"ABOS Evaluation Lab delivers to Lagos and Abuja. Standard delivery to Abuja takes 2-3 business days.",category:"delivery",active:true,created_by:ownerId},
      {business_id:bid,title:"Returns",content:"Unused items can be returned within 7 days with the order reference.",category:"returns",active:true,created_by:ownerId},
      {business_id:bid,title:"Payments",content:"Payment is by bank transfer. Test payment account: BANK TEST / 0000000000. Customers should send the transfer receipt after payment.",category:"payment",active:true,created_by:ownerId},
      {business_id:bid,title:"Location",content:"We are located in Yaba, Lagos, Nigeria.",category:"location",active:true,created_by:ownerId}
    ]);
    if (ke) throw ke;


    return {businessId:bid, ownerId, products};
  } catch (error) {
    // If setup fails after the test business is created, remove the partial fixture too.
    try {
      await cleanup(bid, "fixture-creation-failed");
    } catch (cleanupError) {
      console.error("abos-ai-eval: partial fixture cleanup failed:", cleanupError instanceof Error ? cleanupError.message : String(cleanupError));
    }
    throw error;
  }
}
async function runScenario(fixture:any, ev:any, index:number, batchId:string) {
  const {businessId} = fixture;
  const phone = "+234800000" + String(index).padStart(4,"0");

  const customerName = ev.name === "customer-identity" ? "Kunle" : "Eval Customer " + index;

  const {data: customer, error: ce} = await supabase.from("customers").insert({
    business_id:businessId,
    name:customerName,
    phone
  }).select("id").single();
  if (ce) throw ce;

  const {data: conversation, error: coe} = await supabase.from("conversations").insert({
    business_id:businessId,
    customer_id:customer.id,
    customer_name:"Eval Customer " + index,
    customer_phone:phone,
    channel:"web",
    external_thread_id:"eval-"+index,
  }).select("id").single();
  if (coe) throw coe;

  const history = Array.isArray(ev.conversation_history) ? ev.conversation_history : [];
  if (history.length) {
    const rows = history.map((m:any)=>({
      conversation_id:conversation.id,
      business_id:businessId,
      direction:m.direction === "assistant" ? "outgoing" : "incoming",
      content:String(m.content ?? ""),
      channel:"web",
      status:"sent",
      metadata:{evaluation:true},
    }));
    const {error: me} = await supabase.from("messages").insert(rows);
    if (me) throw me;
  }

  let orderId = null;
  if (ev.name === "order-status") {
    const {data:o,error:oe} = await supabase.from("orders").insert({
      business_id:businessId,
      customer_id:customer.id,
      order_number:"AB123",
      status:"processing",
      total_amount:45000,
      currency:"NGN",
      notes:"Evaluation order."
    }).select("id").single();
    if (oe) throw oe;
    orderId = o.id;
    const {data:bp} = await supabase.from("products").select("id,name").eq("business_id",businessId).eq("name","Black Sneakers").single();
    const {error:ie} = await supabase.from("order_items").insert({
      order_id:orderId,
      product_id:bp?.id ?? null,
      product_name:"Black Sneakers",
      unit_price:45000,
      quantity:1,
      subtotal:45000
    });
    if (ie) throw ie;
  }

  const response = await fetch(AGENT_URL, {
    method:"POST",
    headers:{
      "content-type":"application/json",
      "x-abos-internal-key":SERVICE_ROLE,
    },
    body:JSON.stringify({
      business_id:businessId,
      conversation_id:conversation.id,
      message_id:null,
      message:String(ev.input_message),
      trigger:"internal"
    }),
  });

  const payload = await response.json();
  const analysis = payload?.analysis ?? {};
  const calls = Array.isArray(payload?.tool_calls) ? payload.tool_calls.filter((x:any)=>x?.ok) : [];

  const scores = {
    transport_ok:response.ok && payload?.ok === true,
    language:languageMatch(ev.expected_language ?? "unknown", analysis.language ?? ""),
    intent:intentMatch(ev.expected_intent ?? "unknown", analysis.intent ?? ""),
    entities:entitySubset(ev.expected_entities ?? {}, analysis.entities ?? {}),
    action:actionMatch(ev.expected_action?.action ?? "", calls, String(payload?.answer ?? "")),
    reply:typeof payload?.answer === "string" && payload.answer.trim().length > 0,
    analysis_recorded:Boolean(payload?.analysis_recorded),
  };

  const passed = Object.values(scores).every(Boolean);

  const {error: re} = await supabase.from("ai_agent_evaluation_runs").insert({
    batch_id:batchId,
    scenario_index:index,
    latency_ms:payload?.latency_ms ?? null,
    evaluation_id:ev.id,
    model:payload?.model ?? "unknown",
    predicted_language:analysis.language ?? null,
    predicted_intent:analysis.intent ?? null,
    predicted_entities:analysis.entities ?? {},
    tool_calls:calls,
    answer:payload?.answer ?? null,
    scores:{...scores,latency_ms:payload?.latency_ms ?? null,run_id:payload?.run_id ?? null},
    passed
  });
  if (re) throw re;

  return {
    id:ev.id,
    model:payload?.model ?? "unknown",
    name:ev.name,
    category:ev.category,
    passed,
    scores,
    predicted:{language:analysis.language ?? null,intent:analysis.intent ?? null,entities:analysis.entities ?? {}},
    tools:calls.map((x:any)=>x.name),
    answer:String(payload?.answer ?? ""),
    error:payload?.error ?? payload?.detail ?? null
  };
}

async function cleanup(businessId:string, batchId:string) {
  const tables = [
    "ai_agent_runs",
    "conversation_ai_state",
    "activity_events",
    "notes",
    "tasks",
    "leads",
    "messages",
    "conversations",
    "order_items",
    "orders",
    "business_knowledge",
    "products",
    "customers",
    "business_memberships",
    "integrations",
    "automations",
    "automation_runs",
    "ai_insights"
  ];
  for (const t of tables) {
    await supabase.from(t).delete().eq("business_id",businessId);
  }
  await supabase.from("businesses").delete().eq("id",businessId);
}

Deno.serve(async(req)=>{
  if (req.method === "GET") {
    return json({
      ok:true,
      service:"abos-ai-eval",
      version:"1.3",
      evaluator_key_configured:Boolean(EVAL_KEY || INTERNAL_KEY),
      agent_url:AGENT_URL
    });
  }

  if (req.method !== "POST") return json({error:"method not allowed"},405);

  if (!SERVICE_ROLE) return json({error:"missing server configuration: Supabase service role"},500);

  const suppliedKey = req.headers.get("x-abos-eval-key") ?? req.headers.get("x-abos-internal-key") ?? "";
  let ownerId:string | null = null;

  if ((EVAL_KEY && suppliedKey === EVAL_KEY) || (INTERNAL_KEY && suppliedKey === INTERNAL_KEY)) {
    const {data: users, error: ue} = await supabase.auth.admin.listUsers({page:1,perPage:1});
    if (ue) return json({error:"cannot resolve evaluator owner"},500);
    ownerId = users?.users?.[0]?.id ?? null;
  } else {
    const auth = req.headers.get("Authorization") ?? "";
    if (!auth.startsWith("Bearer ")) return json({error:"authentication required"},401);

    const {data, error} = await supabase.auth.getUser(auth.slice(7));
    if (error || !data.user) return json({error:"authentication required"},401);

    const {data:ownedBusiness, error:oe} = await supabase
      .from("businesses")
      .select("id")
      .eq("owner_id",data.user.id)
      .limit(1)
      .maybeSingle();

    if (oe) return json({error:"unable to verify evaluator access"},500);
    if (!ownedBusiness) return json({error:"evaluation access requires a business owner"},403);

    ownerId = data.user.id;
  }

  if (!ownerId) return json({error:"no evaluation owner available"},500);

  const started = Date.now();
  let fixture:any = null;
  let batchId:string | null = null;

  try {
    if (!ownerId) throw new Error("No evaluation owner exists.");

    const {data:batch,error:be} = await supabase
      .from("ai_agent_evaluation_batches")
      .insert({
        name:"ABOS AI Core V1.3 evaluation",
        model:"abos-agent",
        status:"running",
        created_by:ownerId
      })
      .select("id")
      .single();

    if (be) throw be;
    batchId = batch.id;

    fixture = await createFixture(ownerId);

    const {data:evaluations,error:ee} = await supabase
      .from("ai_agent_evaluations")
      .select("id,name,category,input_message,conversation_history,expected_language,expected_intent,expected_entities,expected_action,expected_reply_style")
      .eq("active",true)
      .order("created_at");

    if (ee) throw ee;

    const results:any[] = [];
    for (let i=0;i<(evaluations ?? []).length;i++) {
      results.push(await runScenario(fixture,evaluations[i],i+1,batchId!));
    }

    const total = results.length;
    const passed = results.filter((r:any)=>r.passed).length;
    const failed = total - passed;
    const byMetric = {
      transport_ok:results.filter((r:any)=>r.scores.transport_ok).length,
      language:results.filter((r:any)=>r.scores.language).length,
      intent:results.filter((r:any)=>r.scores.intent).length,
      entities:results.filter((r:any)=>r.scores.entities).length,
      action:results.filter((r:any)=>r.scores.action).length,
      reply:results.filter((r:any)=>r.scores.reply).length,
      analysis_recorded:results.filter((r:any)=>r.scores.analysis_recorded).length
    };

    const modelName = results.find((r:any)=>r?.model)?.model ?? "unknown";

    if (batchId) {
      await supabase.from("ai_agent_evaluation_batches").update({
        status:"completed",
        model:modelName,
        total_cases:total,
        passed_cases:passed,
        failed_cases:failed,
        pass_rate:total ? Number((passed/total).toFixed(4)) : 0,
        metric_scores:byMetric,
        failure_summary:results.filter((r:any)=>!r.passed).map((r:any)=>({
          name:r.name,
          category:r.category,
          scores:r.scores,
          predicted:r.predicted,
          tools:r.tools,
          error:r.error
        })),
        finished_at:new Date().toISOString()
      }).eq("id",batchId);
    }

    return json({
      ok:true,
      version:"1.3",
      total,
      passed,
      failed,
      pass_rate:total ? Number((passed/total).toFixed(4)) : 0,
      metrics:byMetric,
      latency_ms:Date.now()-started,
      failures:results.filter((r:any)=>!r.passed),
      results
    });
  } catch (error) {
    if (batchId) {
      await supabase.from("ai_agent_evaluation_batches").update({
        status:"failed",
        failure_summary:[{error:error instanceof Error ? error.message : String(error)}],
        finished_at:new Date().toISOString()
      }).eq("id",batchId);
    }
    return json({ok:false,error:error instanceof Error ? error.message : String(error)},500);
  } finally {
    if (fixture?.businessId && batchId) await cleanup(fixture.businessId,batchId);
  }
});