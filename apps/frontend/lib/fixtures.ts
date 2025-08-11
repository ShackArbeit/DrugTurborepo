import type { Case, Evidence, ExaminResult, PickUp } from "./types"

const now = new Date()
const timestamp = () => new Date(now.getTime() - Math.random() * 7 * 24 * 3600000).toISOString()

// 挑選幾種署名與送件人
const submitters = [
  { name: "張三", phone: "0912345678", signature: "張三簽名" },
  { name: "李四", phone: "0923456789", signature: "李四簽名" },
  { name: "王五", phone: "0934567890", signature: "王五簽名" },
]

const createPickUp = (id: number): PickUp => ({
  id,
  evidence_id: id,
  created_at: timestamp(),
  delivery_signature: `DeliverySig${id}.png`,
  receiver_name: "法務官_" + (id % 3 + 1),
  receiver_signature: `ReceiverSig${id}.png`,
  pickup_time: timestamp(),
  photo_path: `pickup_photo${id}.png`,
  remarks: `取件備註_${id}`,
  satisfaction_levelOne: "低",
  satisfaction_levelTwo: "中",
  satisfaction_levelThree: "高",
  satisfaction_levelFour: "極高",
})

const createExaminResult = (id: number): ExaminResult => ({
  id,
  evidence_id: id,
  examiner_name: "鑑識員_" + (id % 3 + 1),
  is_beyond_scope: id % 2 === 0,
  is_info_complete: true,
  is_lab_related: id % 2 === 1,
  is_rejected: id % 5 === 0,
  remarks: `結果備註_${id}`,
  created_at: timestamp(),
  updated_at: timestamp(),
})

const createEvidence = (id: number, caseId: number): Evidence => ({
  id,
  caseId,
  evidenceNumber: `EVID-${String(id).padStart(3, "0")}`,
  evidenceType: ["手機", "筆電", "硬碟"][id % 3],
  evidenceBrand: ["Apple", "Dell", "Samsung"][id % 3],
  evidenceOriginalNo: `ORIG-${id}`,
  evidenceSerialNo: `SN-${id}`,
  pickup: createPickUp(id),
  examinResult: createExaminResult(id),
  photoFront: `evidence_front${id}.png`,
  photoBack: `evidence_back${id}.png`,
  receiverSignature: `ReceiverSig${id}.png`,
  deliverySignature: `DeliverySig${id}.png`,
  receiveTime: timestamp(),
  createdAt: timestamp(),
})

export const EVIDENCES: Evidence[] = []
for (let i = 1; i <= 10; i++) {
  // 隨機分給前3個案件
  const caseId = (i % 3) + 1
  EVIDENCES.push(createEvidence(i, caseId))
}

export const CASES: Case[] = Array.from({ length: 5 }).map((_, idx) => {
  const id = idx + 1
  const sb = submitters[idx % submitters.length]
  const relatedEvidences = EVIDENCES.filter((e) => e.caseId === id)
  return {
    id,
    caseNumber: `1140709GPO${String(id).padStart(4, "0")}`,
    caseName: ["竊盜案", "毒品案", "詐欺案", "殺人案", "妨害公務案"][idx % 5],
    caseType: ["一般犯罪", "毒品犯罪","國安犯罪","內亂犯罪"][idx % 2],
    submitUnit: ["桃園地方檢察署", "臺北高等檢察署","廉政署","調查局"][idx % 2],
    submitterName: sb.name,
    submitterPhone: sb.phone,
    submitterSignature: sb.signature,
    submitterTel: `02-8${String(1234 + id).slice(-4)}`,
    year: 114 + idx,
    section: ["N", "G", "A", "B", "C"][idx % 5],
    prefixLetter: ["N", "G"][idx % 2],
    createdAt: timestamp(),
    evidences: relatedEvidences,
  }
})
