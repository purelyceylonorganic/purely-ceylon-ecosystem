import nodemailer from "nodemailer";

export const transporter = nodemailer.createTransport({
    service: "gmail",

    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
    }
});

export const verifyEmailConnection = async () => {

    try {

        await transporter.verify();

        console.log("✅ Email Server Connected");

    } catch (error) {

        console.error("❌ Email Server Connection Failed");

        console.error(error);

    }

};

export const sendEmail = async (

    to: string,

    subject: string,

    html: string

) => {

    await transporter.sendMail({

        from: `"Purely Ceylon" <${process.env.EMAIL_USER}>`,

        to,

        subject,

        html

    });

};
