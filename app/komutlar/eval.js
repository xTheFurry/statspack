const Discord = require("discord.js");
const db = require('quick.db');


exports.run = async (client, message, args) => {
  
  const tokenuyari = eval.token
  
  const ayarlar = client.ayarlar
  
  let bot = client;
  

	if(!args[0]) {
return
	}
	const code = args.join(' ');
	function clean(text) {
		if (typeof text !== 'string')
			text = require('util').inspect(text, { depth: 0 })
		text = text
			.replace(/`/g, '`' + String.fromCharCode(8203))
			.replace(/@/g, '@' + String.fromCharCode(8203))
		return text;
	};
	async function send(embed) {
		message.channel.send(embed);
	}

	const evalEmbed = new Discord.RichEmbed()
  .setColor("RANDOM")
	try {
		var evaled = clean(await eval(code));
    
    if (code === "2+2" || code === "2 + 2" || code === "Math.floor(2+2)" || code === "Math.floor(2 + 2)") { 
      var evaled = "5"
    };
    
    if(evaled.match(new RegExp(`${client.token}`, 'g'))) evaled.replace(client.token, tokenuyari).replace(process.env.PROJECT_INVITE_TOKEN, tokenuyari);
		if (evaled.constructor.name === 'Promise') evalEmbed.setDescription(`\`\`\`js\n${evaled.replace(client.token, tokenuyari).replace(process.env.PROJECT_INVITE_TOKEN, tokenuyari)}\n\`\`\``)
		else evalEmbed.setDescription(`\`\`\`xl\n${evaled.replace(client.token, tokenuyari).replace(process.env.PROJECT_INVITE_TOKEN, tokenuyari)}\n\`\`\``)
		const newEmbed = new Discord.RichEmbed()
			.addField(`📥 ${eval.giris}`, `\`\`\`js\n${code}\n\`\`\``)
			.addField(`📤 ${eval.cikis}`, `\`\`\`js\n${evaled.replace(client.token, tokenuyari).replace(process.env.PROJECT_INVITE_TOKEN, tokenuyari)}\n\`\`\``)
			.setColor("RANDOM")
		message.channel.send(newEmbed);
	}
	catch (err) {
		evalEmbed.addField(`:x: ${eval.err}`, `\`\`\`js\n${err}\n\`\`\``);
		evalEmbed.setColor('RANDOM');
		message.channel.send(evalEmbed);
	}
}

exports.conf = {
	enabled: true,
	guildOnly: true,
	aliases: ["kod", "kod-çalıştır"],
	permLevel: 4,
	
}

exports.help = {
	name: 'eval',
	description: 'Yazılan kodu çalıştırır.',
	usage: 'eval <kod>',
  kategori: 'yapımcı'
}
