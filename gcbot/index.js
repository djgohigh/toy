const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, interaction, EmbedBuilder, REST, Routes, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { commands, maps } = require('./command.js');
const Database = require("@replit/database");
const token = process.env['token'];
const clientId = process.env['client_id'];
const applicaitonId = process.env['application_id'];

const client = new Client({ intents: [GatewayIntentBits.Guilds] });
const db = new Database();
const rest = new REST({ version: '10' }).setToken(token);
let guild = null;

const { v4 } = require('uuid');
const moment = require("moment");
require('moment-timezone');
moment.locale('ko');
moment.tz.setDefault("Asia/Seoul");


(async () => {
    try {
        console.log('Started refreshing application (/) commands.');
        await rest.put(Routes.applicationCommands(clientId, applicaitonId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');

        // await db.list().then(keys => {
        //    keys.forEach(key => {
        //       db.delete(key);
        //    });
        // });
        
        // await db.list().then(keys => {
        //     console.log(keys);
        // })
    } catch (error) {
        console.error(error);
    }
})();

client.on('ready', () => {
    console.log(`Logged in as ${client.user.tag}!`);
});

client.on(Events.InteractionCreate, async interaction => {

    console.log()

    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (interaction.commandName === '뽑기') {
        const embed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('맵 리스트')
            .setURL('https://910map.tistory.com/')
            .addFields(
                // { name: '(2) Eclipse 1.2', value: 'ASL13', inline: true },
                // { name: '(3) Monopoly 1.4', value: 'ASL13', inline: true },
                // { name: '(4) Metaverse 1.3', value: 'ASL13', inline: true },
                // { name: '(2) Butter 2.0c', value: 'ASL14', inline: true },
                // { name: '(2) Odyssey 1.0', value: 'ASL14', inline: true },
                // { name: '(4) Allegro 1.1c', value: 'ASL14', inline: true },
                // { name: '(4) Nemesis 0.9', value: 'ASL14', inline: true },
                // { name: '(4) Polypoid 1.65', value: '개념맵', inline: true },
                { name: '(2)신 단장의 능선 2.2', value: 'ASL15 Official', inline: false },
                { name: '(3)Neo_Sylphid 3.0', value: 'ASL15 Official', inline: false },
                { name: '(4)Retro 0.95', value: 'ASL15 Official', inline: false },
                { name: '(4)Vermeer SE 2.1', value: 'ASL15 Official', inline: false },
                { name: '(4)투혼 1.3', value: '시즌11 래더공식맵', inline: false },
                // { name: '(4) RevolverSE 2.0', value: 'ASL15 Official', inline: true },
            )

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('noban')
                    .setLabel('맵 뽑기')
                    .setStyle(ButtonStyle.Danger)
                    .setEmoji('🏹')
            );

        await interaction.reply({ embeds: [embed], components: [row] });
    }

    if (interaction.commandName === '조회') {

        let result = [];
        let count = 0;
        
        await db.list().then((res) => {
            res.reverse().forEach((item) => {
                db.get(item).then((data) => {
                    if (data.isComplete === true && data.date !== undefined) {
                        console.log(data);
                        
                        if (count === 10) {
                            return;
                        }

                        let lPoint = 0;
                        let rPoint = 0;

                        if (player1.id === firstGameWinner) {
                            lPoint++;
                        } else {
                            rPoint++;
                        }

                        if (player1.id === secondGameWinner) {
                            lPoint++;
                        } else {
                            rPoint++;
                        }

                        if (thirdGameWinner !== undefined) {
                            if (player1.id === thirdGameWinner) {
                                lPoint++;
                            } else {
                                rPoint++;
                            }
                        }

                        let description = null;
                        
                        if (lPoint >= 2) {
                            description = `${data.player1.username} vs ${data.player2.username}, ${lPoint} : ${rPoint}, 승(${data.player1.username})`
                        } else {
                            description = `${data.player1.username} vs ${data.player2.username}, ${lPoint} : ${rPoint}, 승(${data.player2.username})`
                        }

                        const content = {
                            'name': data.date,
                            'value': `${data.player1.username} vs ${data.player2.username},` 
                        }

                        result.push(data);
                        count++;
                    }
                });
            });
        });

        console.log(result);

        // const exampleEmbed = new EmbedBuilder()
        //     .setColor('Red')
        //     .setTitle('매치 결과조회')
        //     .setDescription('최근 10개의 매치결과입니다.')
        //     .addFields(
        //         { name: '매치업', value: `${player1} vs ${player2}` },
        //         { name: '1세트: ' + users.maps[0].label, value: firstWinner },
        //         { name: '2세트: ' + users.maps[1].label, value: secondWinner },
        //         { name: '3세트: ' + users.maps[2].label, value: '경기없음' },
        //         { name: '승자', value: matchResult },
        //     )
        //     .setTimestamp();

        // interaction.reply({ embeds: [exampleEmbed] });
    }
});

// 버튼 상호작용
client.on(Events.InteractionCreate, async interaction => {

    if (!interaction.isButton()) {
        return;
    }

    if (interaction.customId === 'noban') {
        let users = await client.users.cache;

        let userPickMap = maps.slice();
        let result = [];

        for (let i = 0; i < 3; i++) {
            let random = Math.floor(Math.random() * userPickMap.length);
            result.push(userPickMap[random]);
            userPickMap.splice(random, 1);
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
            .setDescription('Good Luck 🍀');

        const key = v4().replaceAll('-', '');
        await db.set(key, { 'maps': result });

        const row = new ActionRowBuilder()
            .addComponents(
                new ButtonBuilder()
                    .setCustomId('insertResultStart||' + key)
                    .setLabel('이 매치의 결과를 입력할게요')
                    .setStyle(ButtonStyle.Success)
                    .setEmoji('🖋')
            );

        await interaction.reply({ embeds: [nice], components: [row] });
    }

    if (interaction.customId.split('||')[0] === 'insertResultStart') {

        let users = await client.users.cache;
        let options = [];

        // 현재 유저목록 불러오기
        users.forEach(item => {
            let object = {};

            if (item.bot === false) {
                object.label = item.username;
                object.value = item.id;
                options.push(object);
            }
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('selectPlayer1||' + interaction.customId.split('||')[1])
                    .setPlaceholder('플레이어1 선택')
                    .addOptions(options)
            );

        await interaction.reply({ content: '플레이어1을 선택하세요', components: [row] });
    }
});

// select 상호작용
client.on(Events.InteractionCreate, async interaction => {

    const guildId = interaction.guildId;
    let guild = client.guilds.cache.get(guildId);

    if (!interaction.isStringSelectMenu()) {
        return;
    }

    if (interaction.customId.split('||')[0] === 'selectPlayer1') {

        const key = interaction.customId.split('||')[1];

        await db.get(key).then((res) => {
            res.player1 = guild.members.cache.get(interaction.values[0]).user;
            db.set(key, res);
        });

        let users = await client.users.cache;
        let options = [];

        users.forEach(item => {
            let object = {};

            //if (item.bot === false) {
                object.label = item.username;
                object.value = item.id;
                options.push(object);
            // }
        });

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('selectPlayer2||' + interaction.customId.split('||')[1])
                    .setPlaceholder('플레이어2 선택')
                    .addOptions(options)
            );

        await interaction.reply({ content: '플레이어2를 선택하세요', components: [row] });
    }

    if (interaction.customId.split('||')[0] === 'selectPlayer2') {

        let users = null;
        const key = interaction.customId.split('||')[1];

        await db.get(key).then((res) => {
            res.player2 = guild.members.cache.get(interaction.values[0]).user;
            users = res;
            db.set(key, res);
        });

        let options = [];
        
        options.push(selectMemberData(users.player1));
        options.push(selectMemberData(users.player2));

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('firstGameWinner||' + interaction.customId.split('||')[1])
                    .setPlaceholder('1세트 승자')
                    .addOptions(options)
            );

        await interaction.reply({ content: '1세트 승자를 선택하세요', components: [row] });
    }

    if (interaction.customId.split('||')[0] === 'firstGameWinner') {

        let users = null;
        const key = interaction.customId.split('||')[1];

        await db.get(key).then((res) => {
            res.firstGameWinner = interaction.values[0];
            users = res;
            db.set(key, res);
        });

        let options = [];

        options.push(selectMemberData(users.player1));
        options.push(selectMemberData(users.player2));

        const row = new ActionRowBuilder()
            .addComponents(
                new StringSelectMenuBuilder()
                    .setCustomId('secondGameWinner||' + interaction.customId.split('||')[1])
                    .setPlaceholder('2세트 승자')
                    .addOptions(options)
            );

        await interaction.reply({ content: '2세트 승자를 선택하세요', components: [row] });
    }

    if (interaction.customId.split('||')[0] === 'secondGameWinner') {

        let users = null;
        const key = interaction.customId.split('||')[1];

        await db.get(key).then((res) => {
            res.secondGameWinner = interaction.values[0];
            users = res;
            db.set(key, res);
        });

        if (users.firstGameWinner === users.secondGameWinner) {

            const today = moment(new Date).format('YYYY/MM/DD HH:mm:ss');

            await db.get(key).then((res) => {
                res.isComplete = true;
                res.date = today;
                users = res;
                db.set(key, res);
            });
            
            const player1 = selectMemberData(users.player1).label;
            const player2 = selectMemberData(users.player2).label;
            const firstWinner = selectMemberData(await guild.members.cache.get(users.firstGameWinner).user).label;
            const secondWinner = selectMemberData(await guild.members.cache.get(users.secondGameWinner).user).label;

            let winnerCount = 0;

            if (player1 === firstWinner) {
                winnerCount += 1;
            }

            if (player1 === secondWinner) {
                winnerCount += 1;
            }

            if (winnerCount === 2) {
                matchResult = `${player1} 🔥`;
            } else {
                matchResult = `${player2} 🔥`;
            }

            const exampleEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('저장된 매치결과')
                .setDescription(today)
                .addFields(
                    { name: '매치업', value: `${player1} vs ${player2}` },
                    { name: '1세트: ' + users.maps[0].label, value: firstWinner },
                    { name: '2세트: ' + users.maps[1].label, value: secondWinner },
                    { name: '3세트: ' + users.maps[2].label, value: '경기없음' },
                    { name: '승자', value: matchResult },
                )
                .setTimestamp();
            
            interaction.reply({ embeds: [exampleEmbed] });
        } else {

            await db.get(key).then((res) => {
                res.secondGameWinner = interaction.values[0];
                users = res;
                db.set(key, res);
            });

            let options = [];

            options.push(selectMemberData(users.player1));
            options.push(selectMemberData(users.player2));

            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('insertResultEnd||' + interaction.customId.split('||')[1])
                        .setPlaceholder('3세트 승자')
                        .addOptions(options)
                );

            await interaction.reply({ content: '3세트 승자를 선택하세요', components: [row] });
        }
    }

    if (interaction.customId.split('||')[0] === 'insertResultEnd') {

        const key = interaction.customId.split('||')[1];
        const today = moment(new Date).format('YYYY/MM/DD HH:mm:ss');
        let users = null;

        await db.get(key).then((res) => {
            res.thirdGameWinner = interaction.values[0];
            res.isComplete = true;
            res.date = today;
            users = res;
            db.set(key, res);
        });

        const player1 = selectMemberData(users.player1).label;
        const player2 = selectMemberData(users.player2).label;
        const firstWinner = selectMemberData(await guild.members.cache.get(users.firstGameWinner).user).label;
        const secondWinner = selectMemberData(await guild.members.cache.get(users.secondGameWinner).user).label;

        let winnerCount = 0;

        if (player1 === firstWinner) {
            winnerCount += 1;
        }

        if (player1 === secondWinner) {
            winnerCount += 1;
        }

        let thirdWinner = null;

        if (users.thirdGameWinner !== undefined) {
            thirdWinner = selectMemberData(await guild.members.cache.get(users.thirdGameWinner).user).label;
            if (player1 === thirdWinner) {
                winnerCount += 1;
            }
        } else {
            thirdWinner = '경기없음';
        }

        let matchResult = null;

        if (winnerCount >= 2) {
            matchResult = `${player1} 🔥`;
        } else {
            matchResult = `${player2} 🔥`;
        }

        const exampleEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('저장된 매치결과')
            .setDescription(today)
            .addFields(
                { name: '매치업', value: `${player1} vs ${player2}` },
                { name: '1세트: ' + users.maps[0].label, value: firstWinner },
                { name: '2세트: ' + users.maps[1].label, value: secondWinner },
                { name: '3세트: ' + users.maps[2].label, value: thirdWinner },
                { name: '승자', value: matchResult },
            )
            .setTimestamp();

        interaction.reply({ embeds: [exampleEmbed] });
    }
});

client.login(token);

function selectMemberData(member) {

    console.log('member', member);

    let object = {
        'label': member.username,
        'value': member.id,
    }

    return object;
}

// 밴 상호작용
// client.on('interactionCreate', async sitr => {
//   if (!sitr.isSelectMenu()) return;

//   if (sitr.customId === 'select') {
//     let bannedMap = sitr.values;
//     let allMaps = maps;

//     let cleanedMap = allMaps.filter((item) => {
//       return !bannedMap.includes(item.value);
//     });

//     let result = [];
//     for (let i = 0; i < 3; i++) {
//       let random = Math.floor(Math.random() * cleanedMap.length);
//       result.push(cleanedMap[random]);
//       cleanedMap.filter((item) => item !== cleanedMap[random]);
//     }

//     const nice = new EmbedBuilder()
//       .setColor('Red')
//       .setURL('https://910map.tistory.com/')
//       .setTitle('맵 선택결과')
//       .addFields(
//         { name: '1경기', value: result[0].value },
//         { name: '2경기', value: result[1].value },
//         { name: '3경기', value: result[2].value },
//       )
//       .setDescription('Good Luck 🍀');

//     await sitr.reply({ embeds: [nice] });
//   }
// });

