import OpenAI from "openai";
import 'dotenv/config'; 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY  // usa variables de entorno para mayor seguridad
});

async function askGPT(request) {
  const stream = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: request }],
    stream: true
  });

  let fullMessage = "";

  for await (const chunk of stream) {
    const delta = chunk.choices[0]?.delta?.content;
    if (delta) {
      fullMessage += delta;
    }
  }

  return fullMessage;
}


export default class RequestService {
    
    getUserHistory = async (request) => {
        return askGPT("responde de una manera muy corta y consisa a esta peticion: "+ request)
    }
}