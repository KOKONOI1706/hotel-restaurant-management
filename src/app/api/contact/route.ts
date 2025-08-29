import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, subject, message } = await request.json();

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, message: 'Vui lòng điền đầy đủ thông tin bắt buộc' },
        { status: 400 }
      );
    }

    // Create nodemailer transporter (using Gmail SMTP)
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER || 'suoimo4512@gmail.com',
        pass: process.env.GMAIL_APP_PASSWORD, // App password, not regular password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.GMAIL_USER || 'suoimo4512@gmail.com',
      to: 'suoimo4512@gmail.com',
      subject: `[Suối Mơ Resort] ${subject} - ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #2563eb, #06b6d4); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Suối Mơ Resort</h1>
            <p style="color: #e0f2fe; margin: 5px 0;">Tin nhắn mới từ khách hàng</p>
          </div>
          
          <div style="padding: 20px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <h2 style="color: #1e293b; margin-top: 0;">Thông tin liên hệ</h2>
            
            <table style="width: 100%; border-collapse: collapse;">
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569; width: 120px;">Họ tên:</td>
                <td style="padding: 8px 0; color: #1e293b;">${name}</td>
              </tr>
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Email:</td>
                <td style="padding: 8px 0; color: #1e293b;">${email}</td>
              </tr>
              ${phone ? `
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Điện thoại:</td>
                <td style="padding: 8px 0; color: #1e293b;">${phone}</td>
              </tr>
              ` : ''}
              <tr>
                <td style="padding: 8px 0; font-weight: bold; color: #475569;">Chủ đề:</td>
                <td style="padding: 8px 0; color: #1e293b;">${getSubjectName(subject)}</td>
              </tr>
            </table>
          </div>
          
          <div style="padding: 20px; background: white; border: 1px solid #e2e8f0; border-top: none;">
            <h3 style="color: #1e293b; margin-top: 0;">Nội dung tin nhắn:</h3>
            <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; border-left: 4px solid #2563eb;">
              <p style="margin: 0; color: #334155; line-height: 1.6;">${message}</p>
            </div>
          </div>
          
          <div style="padding: 15px; background: #1e293b; text-align: center;">
            <p style="color: #94a3b8; margin: 0; font-size: 14px;">
              Email được gửi từ website Suối Mơ Resort<br>
              Thời gian: ${new Date().toLocaleString('vi-VN')}
            </p>
          </div>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({
      success: true,
      message: 'Tin nhắn đã được gửi thành công!'
    });

  } catch (error) {
    console.error('Contact form error:', error);
    
    // Return a more specific error message
    if (error instanceof Error && error.message.includes('auth')) {
      return NextResponse.json(
        { success: false, message: 'Lỗi xác thực email. Vui lòng thử lại sau.' },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { success: false, message: 'Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại hoặc liên hệ qua hotline.' },
      { status: 500 }
    );
  }
}

function getSubjectName(subject: string): string {
  const subjectMap: { [key: string]: string } = {
    booking: 'Đặt phòng',
    service: 'Dịch vụ',
    complaint: 'Khiếu nại',
    suggestion: 'Góp ý',
    other: 'Khác'
  };
  return subjectMap[subject] || subject;
}
