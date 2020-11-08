const Discord = require("discord.js"),
  db = require("quick.db"),
  ayarlar = require("../config.json");

exports.run = async (client, message, args) => {
  if (!message.member.hasPermission("ADMINISTRATOR"))
    return message.channel.send(
      `Ne yazık ki bu komutu kullanabilmen için; "Yönetici" yetkisine sahip olman lazım!`
    );

  try {
    let role = message.guild.roles.find("name", "@everyone");
    let prefix = (await db.fetch(`prefix_${message.guild.id}`)) || "!";
    let sat = await db.fetch(`kategori_${message.guild.id}`);
    let sa = await db.fetch(`toplamk_${message.guild.id}`);
    let sa1 = await db.fetch(`botk_${message.guild.id}`);
    let sa2 = await db.fetch(`aktif_${message.guild.id}`);
    let sa3 = await db.fetch(`rekor_${message.guild.id}`);
    let sa4 = await db.fetch(`son_${message.guild.id}`);
    if (sa) {
      message.channel
        .send(
          "Panel sıfırlanıyor! Lütfen bekleyiniz!\nNot: Bu biraz zaman alabilir!"
        )
        .then(k => {
          setTimeout(() => {
            db.delete(`toplamk_${message.guild.id}`);
            try {
              message.guild.channels.get(sa).delete();
            } catch (err) {
              return;
            }
          }, 3000);
          setTimeout(() => {
            db.delete(`botk_${message.guild.id}`);
            try {
              message.guild.channels.get(sa1).delete();
            } catch (err) {
              return;
            }
          }, 6000);
          setTimeout(() => {
            db.delete(`aktif_${message.guild.id}`);
            try {
              message.guild.channels.get(sa2).delete();
            } catch (err) {
              return;
            }
          }, 9000);
          setTimeout(() => {
            db.delete(`rekor_${message.guild.id}`);
            try {
              message.guild.channels.get(sa3).delete();
            } catch (err) {
              return;
            }
          }, 12000);
          setTimeout(() => {
            db.delete(`son_${message.guild.id}`);
            try {
              message.guild.channels.get(sa4).delete();
            } catch (err) {
              return;
            }
          }, 15000);
          setTimeout(() => {
            db.delete(`kategori_${message.guild.id}`);
            try {
              message.guild.channels.get(sat).delete();
            } catch (err) {
              return;
            }
          }, 18000);

          setTimeout(() => {
            k.edit("Panel sıfırlandı!");
          }, 19000);
        });
    } else {
      message.channel.send("Panel zaten kurulu değil!\nKurmak için: !kur");
    }
  } catch (err) {
    const embed = new Discord.RichEmbed()
      .setColor("RED")
      .setDescription(
        `Sanırım bir sorun var! Lütfen bunu destek sunucumuza gelip bildir! [Destek Sunucumuz](${ayarlar.sunucu})`
      );
    message.channel.send(embed);
    return;
  }
};

exports.conf = {
  enabled: true,
  guildOnly: true,
  aliases: ["panel-sil", "sıfırla"],
  permLevel: 0
};

exports.help = {
  name: "panel-sıfırla",
  description: "panel-sıfırla",
  usage: "panel-sıfırla"
};
