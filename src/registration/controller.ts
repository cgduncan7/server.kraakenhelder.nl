import { existsSync } from 'fs'
import { GoogleAuth } from 'google-auth-library'
import { google } from 'googleapis'

const SPREADSHEET_ID = '1vSKlfedcRSDqmy_z2fwd2OuqZwckLW68xg_JPt-FlYM'
const SHEET_NAME = 'Creatieve Schrijfsessies'

/**
 * Gets Google Auth from local credentials
 */
let googleAuth: GoogleAuth | null
const getGoogleAuth = () => {
  if (googleAuth) return googleAuth

  if (!existsSync('./private/credentials.json')) {
    throw new Error('Credentials not found');
  }

  googleAuth = new google.auth.GoogleAuth({
    keyFilename: './private/credentials.json',
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  return googleAuth
}

/**
 * Prints the data in the spreadsheet:
 * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
 * @param auth The authenticated Google client
 */
const listData = async (auth: GoogleAuth): Promise<string[][] | null> => {
  const sheets = google.sheets({ version: 'v4', auth })
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!B2:B`
  })
    
  const rows = res?.data.values
  if (rows && rows.length) {
    return rows
  } else {
    return null
  }
}

/**
 * Appends a new row to the sheet
 * @param auth The authenticated Google client
 * @param data Name and email to register
 */
const writeData = async (auth: GoogleAuth, data: { name: string, email: string, phoneNumber?: string}) => {
  const sheets = google.sheets({ version: 'v4', auth })
  const date = new Date().toDateString()
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_NAME}!A:D`,
    valueInputOption: 'raw',
    requestBody: { values: [[data.name, data.email, data.phoneNumber ?? '', date]] }
  })
}

/**
 * Adds a new email to sheet if it doesn't already exist
 * @param data Name and email to register
 */
export const registerPerson = async (data: { name: string, email: string, phoneNumber?: string }) => {
  const googleAuth = getGoogleAuth()

  const currentPeople = await listData(googleAuth)
  if (currentPeople?.find(([, email]) => email === data.email) === undefined) {
    await writeData(googleAuth, data);
  }
}