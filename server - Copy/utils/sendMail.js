import nodemailer from 'nodemailer'
import createError from './error.js'

const sendEmail = async (from, to, subject, html) => {
    try {
        // Input validation
        if (!to || !subject || !html) {
            throw new Error('Missing required email parameters')
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_ID,
                pass: process.env.GMAIL_PASS,
            },
        })

        // Send email
        const info = await transporter.sendMail({
            from: from || process.env.GMAIL_ID,
            to,
            subject,
            html,
        })

        console.log(`Email sent successfully to ${to}`)
        return info

    } catch (error) {
        console.error('Error sending email:', error)
        throw createError(500, `Failed to send email: ${error.message}`)
    }
}

export default sendEmail
