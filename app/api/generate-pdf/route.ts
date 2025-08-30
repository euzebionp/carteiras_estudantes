import { type NextRequest, NextResponse } from "next/server"
import { generateStudentIdPDF } from "@/lib/pdf-generator"
import { getStudentData } from "@/lib/student-database"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()

    const studentIdNumber = formData.get("studentIdNumber") as string

    let studentFromDb = null
    try {
      studentFromDb = await getStudentData(studentIdNumber)
    } catch (error) {
      console.error("Error fetching student data:", error)
    }

    const studentData = {
      fullName: studentFromDb?.name || (formData.get("fullName") as string) || "",
      birthDate: formData.get("birthDate") as string,
      schoolName: formData.get("schoolName") as string,
      gradeLevel: formData.get("gradeLevel") as string,
      course: formData.get("course") as string,
      registrationNumber: formData.get("registrationNumber") as string,
      studentIdNumber: studentIdNumber,
      schoolAddress: formData.get("schoolAddress") as string,
      contactInfo: formData.get("contactInfo") as string,
      city: formData.get("city") as string,
      transportType: formData.get("transportType") as string,
      photo: formData.get("photo") as File | null,
      cpf: studentFromDb?.cpf || "",
      rg: studentFromDb?.rg || "",
    }

    const sendByEmail = formData.get("sendByEmail") === "true"
    const emailAddress = formData.get("emailAddress") as string

    const requiredFields = [
      { field: "fullName", label: "Nome completo" },
      { field: "birthDate", label: "Data de nascimento" },
      { field: "schoolName", label: "Nome da escola" },
      { field: "gradeLevel", label: "Nível de ensino" },
      { field: "course", label: "Nome do curso" },
      { field: "studentIdNumber", label: "Número de matrícula" },
      { field: "contactInfo", label: "Informações de contato" },
      { field: "city", label: "Cidade" },
      { field: "transportType", label: "Tipo de transporte" },
    ]

    for (const { field, label } of requiredFields) {
      if (!studentData[field as keyof typeof studentData]) {
        return NextResponse.json({ error: `Campo obrigatório: ${label}` }, { status: 400 })
      }
    }

    if (!studentData.photo) {
      return NextResponse.json({ error: "Foto é obrigatória" }, { status: 400 })
    }

    if (sendByEmail && !emailAddress) {
      return NextResponse.json({ error: "E-mail é obrigatório para envio por e-mail" }, { status: 400 })
    }

    let pdfBlob: Blob
    try {
      pdfBlob = await generateStudentIdPDF(studentData)
    } catch (pdfError) {
      console.error("Error generating PDF:", pdfError)
      return NextResponse.json({ error: "Erro ao gerar PDF. Verifique os dados e tente novamente." }, { status: 500 })
    }

    if (sendByEmail) {
      try {
        console.log(`[v0] Mock email sent to ${emailAddress} for student ${studentData.fullName}`)

        return NextResponse.json({
          success: true,
          message: "Carteira enviada por e-mail com sucesso",
        })
      } catch (emailError) {
        console.error("Error sending email:", emailError)
        return NextResponse.json(
          { error: "Erro ao enviar e-mail. Tente novamente ou baixe diretamente." },
          { status: 500 },
        )
      }
    } else {
      const buffer = await pdfBlob.arrayBuffer()
      const fileName = studentData.fullName
        .replace(/\s+/g, "-")
        .toLowerCase()
        .replace(/[^a-z0-9-]/g, "") // Remove special characters

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": `attachment; filename="${fileName}.pdf"`,
        },
      })
    }
  } catch (error) {
    console.error("Error in PDF generation API:", error)
    return NextResponse.json(
      {
        error: "Erro interno do servidor. Tente novamente em alguns instantes.",
      },
      { status: 500 },
    )
  }
}
