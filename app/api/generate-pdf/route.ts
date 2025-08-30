import { type NextRequest, NextResponse } from "next/server"
import { generateStudentIdPDF } from "@/lib/pdf-generator"
import { getStudentData } from "@/lib/student-database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const studentIdNumber = formData.get("studentIdNumber") as string
    const studentFromDb = await getStudentData(studentIdNumber)

    const studentData = {
      fullName: studentFromDb?.name || (formData.get("fullName") as string),
      birthDate: formData.get("birthDate") as string,
      schoolName: formData.get("schoolName") as string,
      gradeLevel: formData.get("gradeLevel") as string,
      course: formData.get("course") as string,
      studentIdNumber: studentIdNumber,
      schoolAddress: formData.get("schoolAddress") as string,
      contactInfo: formData.get("contactInfo") as string,
      city: formData.get("city") as string,
      transportType: formData.get("transportType") as string,
      photo: formData.get("photo") as File | null,
      cpf: studentFromDb?.cpf || "",
      rg: studentFromDb?.rg || "",
    }

    const sendByEmail = true
    const emailAddress = formData.get("emailAddress") as string

    const requiredFields = [
      "fullName",
      "birthDate",
      "schoolName",
      "gradeLevel",
      "course",
      "studentIdNumber",
      "contactInfo",
      "city",
      "transportType",
    ]
    for (const field of requiredFields) {
      if (!studentData[field as keyof typeof studentData]) {
        return NextResponse.json({ error: `Campo obrigatório: ${field}` }, { status: 400 })
      }
    }

    if (!studentData.photo) {
      return NextResponse.json({ error: "Foto é obrigatória" }, { status: 400 })
    }

    if (!emailAddress) {
      return NextResponse.json({ error: "E-mail é obrigatório" }, { status: 400 })
    }

    const pdfBlob = await generateStudentIdPDF(studentData)

    try {
      console.log(`[v0] Mock email sent to ${emailAddress} for student ${studentData.fullName}`)

      return NextResponse.json({
        success: true,
        message: "Carteira enviada por e-mail com sucesso",
      })
    } catch (emailError) {
      console.error("Error sending email:", emailError)
      return NextResponse.json({ error: "Erro ao enviar e-mail. Tente novamente." }, { status: 500 })
    }
  } catch (error) {
    console.error("Error generating PDF:", error)
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 })
  }
}
