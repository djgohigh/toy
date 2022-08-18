const { Client, GatewayIntentBits, EmbedBuilder, REST, Routes, ActionRowBuilder, SelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { token, client_id } = require('./config.json');
const { commands, maps } = require('./command.js');
const cheerio = require('cheerio');
const request = require('request');

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
	console.log(`Logged in as ${client.user.tag}!`);
});
  
client.on('interactionCreate', async interaction => {
	if (!interaction.isChatInputCommand()) {
        return;   
    }
  
	if (interaction.commandName === '덥비') {
        let options = {
            url: 'http://results.dogpile.com/serp?qc=images&q=steelpipe',
            method: 'GET',
            headers: {
                'Accept': 'text/html',
                'User-Agent': 'Chrome'
            }
            
        };
        
        request(options, async function(error, response, responseBody){
            if (error){
                return;
            }
            
            $ = cheerio.load(responseBody);
            
            let links = $('.image a.link');
            
            console.log(links.children);
            let urls = new Array(links.length).fill(0).map((v, i) => links.eq(i).attr('href'));
            
            if (!urls.length){
                return;
            }
            
            await interaction.reply({ files : [urls[Math.floor(Math.random() * urls.length)]] });
        });
	}
	
	if (interaction.commandName === '맵다') {
        const exampleEmbed = new EmbedBuilder()
        .setColor("Red")
        .setTitle('맵 다운 링크(클릭)')
        .setURL('https://910map.tistory.com/')
        .setDescription('강구열의 스타크래프트 맵')
        .addFields(
            { name: '맵이 없는 사람은 사용하기 바랍니다.', value : '관련 사진과 맵은 관계없습니다.' },
        )
        .setImage('http://db.kookje.co.kr/news2000/photo/2022/0524/L20220524.99099006875i1.jpg')
        .setTimestamp();
    
        await interaction.reply({ embeds: [exampleEmbed] });
    }
    
    if (interaction.commandName === '맵선') {
        const embed = new EmbedBuilder()
			.setColor('Red')
			.setTitle('맵 리스트 (총 12개)')
			.setURL('https://910map.tistory.com/')
			.addFields(
                { name: '(2) Eclipse 1.2', value: 'ASL13', inline : true },
                { name: '(3) Monopoly 1.4', value: 'ASL13', inline : true },
                { name: '(4) Metaverse 1.3', value: 'ASL13', inline : true },
                { name: '(4) RevolverSE 2.0', value: 'ASL13', inline : true },
                { name: '(2) Butter 2.0c', value: 'ASL14', inline : true },
                { name: '(2) Odyssey 1.0', value: 'ASL14', inline : true },
                { name: '(3) Neo_Sylphid 3.0', value: 'ASL14', inline : true },
                { name: '(4) Allegro 1.1c', value: 'ASL14', inline : true },
                { name: '(4) Nemesis 0.9', value: 'ASL14', inline : true },
                { name: '(4) Vermeer SE 2.1', value: 'ASL14', inline : true },
                { name: '(4) Polypoid 1.65', value: '개념맵', inline : true },
                { name: '(4) 투혼 1.3', value: '개념맵', inline : true },
            )
            
        const row = new ActionRowBuilder()
			.addComponents(
                new ButtonBuilder()
                .setCustomId('noban')
                .setLabel('🗡 바로뽑기')
                .setStyle(ButtonStyle.Primary),
				new ButtonBuilder()
    				.setCustomId('ban')
    				.setLabel('⚒ 밴하고뽑기')
    				.setStyle(ButtonStyle.Secondary),

		);

        await interaction.reply({ embeds: [embed], components : [row] });
    }
});

// 버튼 상호작용
client.on('interactionCreate', async btnItr => {
	if (!btnItr.isButton()) return;
	console.log(btnItr.customId);
	
	if (btnItr.customId === 'noban') {
	    let userPickMap = maps;
	    let result = [];
	    
        for (let i = 0; i < 3 ; i++) {
            let random = Math.floor(Math.random() * userPickMap.length);
            result.push(userPickMap[random]);
            userPickMap.filter((item) => item !== userPickMap[random]);
        }
        
        console.log(result);
        
        const nice = new EmbedBuilder()
        	.setColor('Red')
        	.setURL('https://910map.tistory.com/')
        	.setTitle('맵 선택결과')
        	.addFields(
        		{ name: '1경기', value: result[0].value },
        		{ name: '2경기', value: result[1].value },
        		{ name: '3경기', value: result[2].value },
        	)
        	.setFooter({ text: '🍀 Good Luck !' });
        	
        await btnItr.reply({ embeds : [nice] });
    }
    
    if (btnItr.customId === 'ban') {
        const row = new ActionRowBuilder()
			.addComponents(
				new SelectMenuBuilder()
					.setCustomId('select')
					.setPlaceholder('밴할 맵 선택')
					.setMinValues(0)
					.setMaxValues(maps.length - 3)
					.addOptions(maps),
		);
		
		await btnItr.reply({ content: '맵을 선택하세요 !', components: [row] });
    }
});

client.on('interactionCreate', async sitr => {
	if (!sitr.isSelectMenu()) return;
	
	if (sitr.customId === 'select') {
        let bannedMap = sitr.values;
        let allMaps = maps;
        
        let cleanedMap = allMaps.filter((item) => {
            return !bannedMap.includes(item.value);
        });
        
        let result = [];
        for (let i = 0; i < 3 ; i++) {
            let random = Math.floor(Math.random() * cleanedMap.length);
            result.push(cleanedMap[random]);
            cleanedMap.filter((item) => item !== cleanedMap[random]);
        }
        
        const nice = new EmbedBuilder()
        	.setColor('Red')
        	.setURL('https://910map.tistory.com/')
        	.setTitle('맵 선택결과')
        	.addFields(
        		{ name: '1경기', value: result[0].value },
        		{ name: '2경기', value: result[1].value },
        		{ name: '3경기', value: result[2].value },
        	)
        	.setFooter({ text: '🍀 Good Luck !' });
        	
        await sitr.reply({ embeds : [nice] });
    }
});

client.login(token);

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands(client_id), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();