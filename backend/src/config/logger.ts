import winston from 'winston';
import path from 'path';

// 📂 லாக் ஃபைல்கள் சேமிக்கப்படும் டைரக்டரி (Logs Folder)
const logDirectory = path.join(process.cwd(), 'logs');

export const logger = winston.createLogger({
  level: 'info', // குறைந்தபட்ச லாக் லெவல்
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }), // எரர் வந்தால் அதன் ஸ்டேக் ட்ரேஸையும் காட்டும்
    winston.format.json() // ப்ரொடக்‌ஷனில் பகுப்பாய்வு செய்ய JSON வடிவம்
  ),
  defaultMeta: { service: 'purely-ceylon-backend-ecosystem' },
  transports: [
    // 🔴 1. அனைத்து எரர்களையும் மட்டும் தனியாகப் பிரித்துச் சேமிக்கும் ஃபைல்
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'error.log'), 
      level: 'error' 
    }),
    // 🟢 2. எரர், இன்ஃபோ என அனைத்து நிகழ்வுகளையும் சேர்த்துச் சேமிக்கும் மாஸ்டர் ஃபைல்
    new winston.transports.File({ 
      filename: path.join(logDirectory, 'combined.log') 
    }),
  ],
});

// 💻 டெவலப்மென்ட் மோடில் இருந்தால், டெர்மினல் கன்சோலிலும் வண்ணமயமாக (Colorized) லாக் காட்டும் அமைப்பு
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, service, ...rest }) => {
        const details = Object.keys(rest).length ? JSON.stringify(rest) : '';
        return `[${timestamp}] [${level}] [${service}]: ${message} ${details}`;
      })
    ),
  }));
}