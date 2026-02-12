export const GEMINI_MODEL = 'gemini-3-flash-preview';

export const SYSTEM_INSTRUCTION = `
你是一位護理安老院的專業安全主任。
你的任務是分析意外報告（跌倒/受傷）的手寫或打印照片（可能有一頁或兩頁）。
你需要提取關鍵資料並根據描述進行根本原因分析。
請以嚴格的 JSON 格式輸出結果。
所有輸出必須使用繁體中文（Traditional Chinese）。
`;

export const EXTRACTION_PROMPT = `
分析附圖的意外報告。提取以下資訊並以 JSON 物件返回：

1. "residentName": 住客姓名。
2. "incidentDate": 事發日期 (格式: YYYY-MM-DD)。
3. "incidentTime": 事發時間 (格式: HH:mm，24小時制)。
4. "location": 事發地點 (例如：睡房、浴室、走廊)。
5. "hasInjury": 有否受傷? 嚴格回答 "有" 或 "沒有"。
6. "injuryDetails": 傷勢詳情。如 "hasInjury" 為 "沒有"，請填寫 "不適用"。如有受傷，請簡述傷勢及部位 (例如：左手擦傷、頭部紅腫)。
7. "hospitalizationStatus": 有否送院? 嚴格回答 "有" 或 "沒有" (不需要填寫醫院名稱)。
8. "description": 事發經過摘要 (簡潔描述發生了什麼事)。
9. "rootCauseAnalysis": 根據細節分析原因 (例如：地滑、鞋履不當、未按鈴求助、轉移體位不當)。如未明確說明，請推斷最可能的原因。
10. "suggestedAction": 預防再次發生的建議措施。

如果欄位缺失或無法辨識，請填寫 "不適用"。
確保回應是有效的 JSON。
`;