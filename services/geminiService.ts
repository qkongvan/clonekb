
import { GoogleGenAI } from "@google/genai";

export async function generateScriptFromVideo(videoBase64: string, mimeType: string): Promise<string> {
  const modelName = 'gemini-2.5-flash-preview-09-2025';
  
  // Lấy danh sách key từ localStorage
  const savedKeysRaw = localStorage.getItem('user_api_keys') || '';
  const keysList = savedKeysRaw.split('\n').map(k => k.trim()).filter(k => k.length > 0);
  
  // Chọn key: Ưu tiên key người dùng nhập, nếu không có thì dùng process.env.API_KEY
  let selectedKey = process.env.API_KEY || '';
  if (keysList.length > 0) {
    // Xoay vòng ngẫu nhiên để tối ưu quota
    selectedKey = keysList[Math.floor(Math.random() * keysList.length)];
  }

  const ai = new GoogleGenAI({ apiKey: selectedKey });

  const prompt = `
    Phân tích video này và cung cấp một kịch bản chi tiết.
    
    YÊU CẦU ĐỊNH DẠNG BẮT BUỘC:
    1. Câu thoại của mỗi 1 cảnh quay phải viết liền mạch, hết cảnh xuống dòng.
    2. Trình bày thoáng, dễ đọc, viết hoa các chữu đầu câu.
    3. Tuyệt đối không chú thích các mốc thời gian.
    
    Nội dung bao gồm:
    - Lời thoại chính xác.
    
    Hãy trả lời hoàn toàn bằng tiếng Việt.
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelName,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: videoBase64,
            },
          },
          { text: prompt },
        ],
      },
    });

    if (!response || !response.text) {
      throw new Error("Không nhận được phản hồi từ AI.");
    }

    return response.text;
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    if (error.status === 403 || error.status === 401) {
      throw new Error("API Key không hợp lệ hoặc đã hết hạn. Vui lòng kiểm tra lại cấu hình Key của bạn.");
    }
    if (error.status === 429) {
      throw new Error("Tần suất yêu cầu quá cao (Rate limit). Vui lòng thêm nhiều Key hơn hoặc thử lại sau.");
    }
    throw new Error(error.message || "Đã xảy ra lỗi khi xử lý video.");
  }
}
