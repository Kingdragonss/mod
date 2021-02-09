const Discord = require("discord.js");
const moment = require("moment");
const talkedRecently = new Set();
const ayarlar = require("../ayarlar.json");
const db = require("quick.db");
const ms = require("ms");
const { parseZone } = require("moment");
const prefix = ayarlar.Prefix

module.exports.run = async(client, message, args)  => {

  
 if(!message.member.roles.cache.get(ayarlar.BanYetkilisi) && !message.member.hasPermission('ADMINISTRATOR')) return message.channel.send('**Bu Komutu Kullanmak İçin Yetkiniz Bulunmamakta.**')

 if(!args[0]) return message.channel.send('**Banlamam gerek kişiyi etiketle!**')

let reason = args.slice(1).join(' ')
let user = message.mentions.users.first() || client.users.get(args[0]) || message.guild.members.find(u => u.user.username.toLowerCase().includes(args[0].toLowerCase())).user
if(!reason) return message.channel.send('**Bir Sebep Belirt.**')
if(!user) return message.channel.send('**Belirtilen Kullanıcı Sunucuda Bulunmamakta.**')
let member = message.guild.member(user)
if(!member) return message.channel.send('**Belirtilen Kullanıcı Sunucuda Bulunmamakta.**')
if(member.roles.highest.position >= message.member.roles.highest.position) return message.channel.send('**Etiketlenen Kullanıcı Sizden Üst/Aynı Pozisyonda.**')
  member.ban({days: 7, reason: reason})

         const embed = new Discord.MessageEmbed()
        .setAuthor(message.author.username, message.author.avatarURL ({ dynamic : true }))
        .setColor(`GREEN`)
        .setDescription(`<@${member.id}> (\`${member.id}\`) Adlı Kullanıcı <@${message.author.id}> Tarafından Sunucudan Yasaklandı.

      • Yetkili: <@${message.author.id}> (\`${message.author.id}\`)
      • Sebebi: \`${reason}\`
      • Kanal: \`${message.channel.name}\`
        `)
        client.channels.cache.get(ayarlar.BanKanal).send(embed)
        message.react('🚀')

};
exports.conf = {
    enabled: true,
    guildOnly: true,
    aliases: ["ban", "yasakla"],
    PermLvl: 0,
}

exports.help = {
  name: 'ban'
};