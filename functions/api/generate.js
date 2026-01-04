// AI 金句生成代理 - 隐藏 API Key
export async function onRequestPost(context) {
  const { request, env } = context;
  
  // CORS 头
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  try {
    // 检查环境变量
    if (!env.API_BASE_URL || !env.API_KEY) {
      return new Response(JSON.stringify({ error: '服务端未配置 API，请联系管理员' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    const body = await request.json();
    
    // 构建 API URL（去掉末尾斜杠）
    const baseUrl = env.API_BASE_URL.replace(/\/+$/, '');
    
    // 调用 AI API
    const response = await fetch(`${baseUrl}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${env.API_KEY}`,
      },
      body: JSON.stringify({
        model: env.AI_MODEL || 'glm-4.7',
        messages: body.messages,
        max_tokens: 150,
        temperature: 0.8,
      }),
    });

    const text = await response.text();
    
    // 检查响应是否为空
    if (!text) {
      return new Response(JSON.stringify({ error: 'AI API 返回空响应' }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }

    // 尝试解析 JSON
    let data;
    try {
      data = JSON.parse(text);
    } catch (e) {
      return new Response(JSON.stringify({ error: `AI API 返回非 JSON: ${text.substring(0, 200)}` }), {
        status: 502,
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      });
    }
    
    return new Response(JSON.stringify(data), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    });
  }
}

// 处理 CORS 预检请求
export async function onRequestOptions() {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
