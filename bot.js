const Discord = require('discord.js');//
const client = new Discord.Client();//
const ayarlar = require('./ayarlar.json');//
const chalk = require('chalk');//
const moment = require('moment');//
var Jimp = require('jimp');//
const { Client, Util } = require('discord.js');//
const fs = require('fs');//
const db = require('quick.db');//
const express = require('express');//
require('./util/eventLoader.js')(client);//
const path = require('path');//
const snekfetch = require('snekfetch');//
const ms = require('ms');//
//

var prefix = ayarlar.prefix;//
//
const log = message => {//
    console.log(`${message}`);//
};

client.commands = new Discord.Collection();//
client.aliases = new Discord.Collection();//
fs.readdir('./komutlar/', (err, files) => {//
    if (err) console.error(err);//
    log(`${files.length} komut yüklenecek.`);//
    files.forEach(f => {//
        let props = require(`./komutlar/${f}`);//
        log(`Yüklenen komut: ${props.help.name}.`);//
        client.commands.set(props.help.name, props);//
        props.conf.aliases.forEach(alias => {//
            client.aliases.set(alias, props.help.name);//
        });
    });
});




client.reload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.load = command => {
    return new Promise((resolve, reject) => {
        try {
            let cmd = require(`./komutlar/${command}`);
            client.commands.set(command, cmd);
            cmd.conf.aliases.forEach(alias => {
                client.aliases.set(alias, cmd.help.name);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};



client.unload = command => {
    return new Promise((resolve, reject) => {
        try {
            delete require.cache[require.resolve(`./komutlar/${command}`)];
            let cmd = require(`./komutlar/${command}`);
            client.commands.delete(command);
            client.aliases.forEach((cmd, alias) => {
                if (cmd === command) client.aliases.delete(alias);
            });
            resolve();
        } catch (e) {
            reject(e);
        }
    });
};

client.elevation = message => {
    if (!message.guild) {
        return;
    }

    let permlvl = 0;
    if (message.member.hasPermission("BAN_MEMBERS")) permlvl = 2;
    if (message.member.hasPermission("ADMINISTRATOR")) permlvl = 3;
    if (message.author.id === ayarlar.sahip) permlvl = 4;
    return permlvl;
};

var regToken = /[\w\d]{24}\.[\w\d]{6}\.[\w\d-_]{27}/g;
// client.on('debug', e => {
//   console.log(chalk.bgBlue.green(e.replace(regToken, 'that was redacted')));
// });
client.on('warn', e => {
    console.log(chalk.bgYellow(e.replace(regToken, 'that was redacted')));
});
client.on('error', e => {
    console.log(chalk.bgRed(e.replace(regToken, 'that was redacted')));
});

client.login(process.env.token);

//--------------------------------------------------------------------------------------\\





//--------------------------------------------------------------------------------------\\



client.on("message" , async msg => {
  
  if(!msg.guild) return;
  if(msg.content.startsWith(ayarlar.prefix+"afk")) return; 
  
  let afk = msg.mentions.users.first()
  
  const kisi = db.fetch(`afkid_${msg.author.id}_${msg.guild.id}`)
  
  const isim = db.fetch(`afkAd_${msg.author.id}_${msg.guild.id}`)
 if(afk){
   const sebep = db.fetch(`afkSebep_${afk.id}_${msg.guild.id}`)
   const kisi3 = db.fetch(`afkid_${afk.id}_${msg.guild.id}`)
   if(msg.content.includes(kisi3)){

       msg.reply(`**Etiketlediğiniz Kişi Afk \nSebep : ${sebep}**`)
   }
 }
  if(msg.author.id === kisi){

       msg.reply(`**Afk'lıktan Çıktınız**`)
   db.delete(`afkSebep_${msg.author.id}_${msg.guild.id}`)
   db.delete(`afkid_${msg.author.id}_${msg.guild.id}`)
   db.delete(`afkAd_${msg.author.id}_${msg.guild.id}`)
    msg.member.setNickname(isim)
    
  }
  
});


//--------------------------------------------------------------------------------------\\

client.on('guildMemberAdd', async(member) => {
let rol = member.guild.roles.cache.find(r => r.name === "JAİL");
let cezalımı = db.fetch(`cezali_${member.guild.id + member.id}`)
let sürejail = db.fetch(`süreJail_${member.id + member.guild.id}`)
if (!cezalımı) return;
if (cezalımı == "cezali") {
member.roles.add(ayarlar.JailCezalıRol)
 
member.send("Cezalıyken Sunucudan Çıktığın için Yeniden Cezalı Rolü Verildi!")
 setTimeout(function(){
    // msg.channel.send(`<@${user.id}> Muten açıldı.`)
db.delete(`cezali_${member.guild.id + member.id}`)
    member.send(`<@${member.id}> Cezan açıldı.`)
    member.roles.remove(ayarlar.JailCezalıRol);
  }, ms(sürejail));
}
})

//--------------------------------------------------------------------------------------\\

client.on('guildMemberAdd', async(member) => {
let mute = member.guild.roles.cache.find(r => r.name === "MUTED");
let mutelimi = db.fetch(`muteli_${member.guild.id + member.id}`)
let süre = db.fetch(`süre_${member.id + member.guild.id}`)
if (!mutelimi) return;
if (mutelimi == "muteli") {
member.roles.add(ayarlar.MuteliRol)
 
member.send("Muteliyken Sunucudan Çıktığın için Yeniden Mutelendin!")
 setTimeout(function(){
    // msg.channel.send(`<@${user.id}> Muten açıldı.`)
db.delete(`muteli_${member.guild.id + member.id}`)
    member.send(`<@${member.id}> Muten açıldı.`)
    member.roles.remove(ayarlar.MuteliRol);
  }, ms(süre));
}
})

//--------------------------------------------------------------------------------------\\


client.on('guildMemberAdd', async member => {
const data = require('quick.db')
const asd = data.fetch(`${member.guild.id}.jail.${member.id}`)
if(asd) {
let data2 = await data.fetch(`jailrol_${member.guild.id}`)
let rol = member.guild.roles.cache.get(data2)
if(!rol) return;
let kişi = member.guild.members.cache.get(member.id)
kişi.roles.add(rol.id);
kişi.roles.cache.forEach(r => {
kişi.roles.remove(r.id)
data.set(`${member.guild.id}.jail.${kişi.id}.roles.${r.id}`, r.id )})
    data.set(`${member.guild.id}.jail.${kişi.id}`)
  const wasted = new Discord.MessageEmbed()
  .setAuthor(member.user.tag, member.user.avatarURL({ dynamic : true }))
  .setColor(`#f3c7e1`)
  .setDescription(`Jaildan Kaçamazsın!`)
  .setTimestamp()
    member.send(wasted)
} 
  
  
})

//--------------------------------------------------------------------------------------\\

//
client.on("message", message => {
    if(message.content.toLowerCase() == "!tag") 
    return message.channel.send(`✵`)
});

client.on("message", message => {
    if(message.content.toLowerCase() == "tag") 
    return message.channel.send(`✵`)
});

client.on("message", message => {
    if(message.content.toLowerCase() == "TAG") 
    return message.channel.send(`✵`)
});

client.on("message", message => {
    if(message.content.toLowerCase() == "tah") 
    return message.channel.send(`ᴴʸᵈʳᵃ`)
});

client.on("message", message => {
    if(message.content.toLowerCase() == "Tag") 
    return message.channel.send(`✵`)
});

client.on("message", message => {
    if(message.content.toLowerCase() == ".tag") 
    return message.channel.send(`✵`)

});

client.on("ready", () => {
  client.channels.cache.get("789194953048981569").join();
})
//


const iltifatlar = [
  '<a:hydrarenklikalp:792002326285254666> Kimse konuşmasın yalnız sen konuş bana. Yalnız sen bak gözlerimin içine. Kimse olmasın yalnızca sen ol benim hayatımda.',
  '<a:hydrarenklikalp:792002326285254666> Gülüşün güzelliğine anlam katıyor. Gamzelerin ise bambaşka diyarların kapılarını açıyor.',
  '<a:hydrarenklikalp:792002326285254666> Ateş gibi yakıyorsun ruhun ile beni. Gözlerin adeta ejderha, alev yayıyor etrafa.',
  '<a:hydrarenklikalp:792002326285254666> Hayatımda  verdiğim belki de en güzel karar seni sevmek olmuş.',
  '<a:hydrarenklikalp:792002326285254666> Gözlerindeki saklı cenneti benden başkası fark etsin istemiyorum.',
  '<a:hydrarenklikalp:792002326285254666> Benim için mutluluğun tanımı, seninle birlikteyken geçirdiğim vakittir.',
  '<a:hydrarenklikalp:792002326285254666> Mucizelerden bahsediyordum. Tam o sırda gözlerin geldi aklıma.',
  '<a:hydrarenklikalp:792002326285254666> En güzel manzaramsın benim, seyretmeye doyamadığım.',
  '<a:hydrarenklikalp:792002326285254666> Gözlerinle baharı getirdin garip gönlüme.',
  '<a:hydrarenklikalp:792002326285254666> Hiç yazılmamış bir şiirsin sen, daha önce eşi benzeri olmayan.',
  '<a:hydrarenklikalp:792002326285254666> Mavi gözlerin, gökyüzü oldu dünyamın.',
  '<a:hydrarenklikalp:792002326285254666> Seni gören kelebekler, narinliğin karşısında mest olur.',
  '<a:hydrarenklikalp:792002326285254666> Huzur kokuyor geçtiğin her yer.',
  '<a:hydrarenklikalp:792002326285254666> Güller bile kıskanır seni gördükleri zaman kendi güzelliklerini.',
  '<a:hydrarenklikalp:792002326285254666> Ben seni seçtim bu hayatta mutlu olabilmek için.',
  '<a:hydrarenklikalp:792002326285254666> Sen bu dünyadaki 7 harikadan bile daha harika bir varlıksın. Sen gönlümün ebedi sultanısın.',
  '<a:hydrarenklikalp:792002326285254666> Sen bir yalan olsan ben yalanı bile  severim. Yeter ki seni sevmek olsun tek mesele.',
  '<a:hydrarenklikalp:792002326285254666> Sen güneşi bense gülüşünü severdim',
  '<a:hydrakalppp:790708517484625972> I love Buşeeeee <a:hydrakalppp:790708517484625972>',
  '<a:hydrakalppp:790708517484625972> Cennette bir melek eksik olmalı çünkü sen, benimle buradasın.',
];
// İLTİFATLARI BU ŞEKİLDE İSTEDİĞİNİZ KADAR ÇOĞALTABİLİRSİNİZ
client.on("message", async message => {
  if(message.channel.id !== "789194952688533558") return;
  let codeAcademy = db.get('chatiltifat');
  await db.add("chatiltifat", 1);
  if(codeAcademy >= 100) {//50 yazan yer kaç mesajda atcağını yazıyor
    db.delete("chatiltifat");
    const random = Math.floor(Math.random() * ((iltifatlar).length - 1) + 1);
    message.reply(`**${(iltifatlar)[random]}**`);
  };
});

client.on("message", async msg => {
  if (msg.content.toLowerCase() === 'sa') {
    msg.reply('Aleyküm Selam Hoşgeldin Nasılsın? <a:hydrayakaladm:789455964457664532> ');
  }
});

client.on("message", async msg => {
  if (msg.content.toLowerCase() === 'Selam') {
    msg.reply('Aleyküm Selam Hoşgeldin Nasılsın? <a:hydrayakaladm:789455964457664532> ');
  }
});

client.on("guildMemberUpdate", async (client, OLD, NEW) => {
if(!OLD.premiumSince && NEW.premiumSince) {
client.channels.cache.get('789194952688533558').send(`${NEW.user.username} Adlı Kullanıcı Sunucumuza Boost Bastı! Teşekkür Ederiz 
<a:hydra:792002325207187506>`)
}
})