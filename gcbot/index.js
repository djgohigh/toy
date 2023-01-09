const { Client, GatewayIntentBits, Events, ModalBuilder, TextInputBuilder, TextInputStyle, interaction, EmbedBuilder, REST, Routes, ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const { commands, maps } = require('./command.js');
const Database = require("@replit/database");
const token = process.env['token'];
const clientId = process.env['client_id'];
const applicaitonId = process.env['application_id'];

const client = new Client({ intents: [GatewayIntentBits.Guilds,
                            		GatewayIntentBits.GuildMessages,
                            		GatewayIntentBits.MessageContent,
                            		GatewayIntentBits.GuildMembers,] });
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
        await rest.put(Routes.applicationCommands(clientId), { body: commands });
        console.log('Successfully reloaded application (/) commands.');

        // await db.list().then(async keys => {
        //     for (let key of keys) {
        //         await db.delete(key);
        //     }
        // });

        // await db.empty();

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

    if (!interaction.isChatInputCommand()) {
        return;
    }

    if (interaction.commandName === '뽑기') {

        await db.list('temp').then(async matches => {
            console.log('matches', matches);
            for (let key of matches) {
                await db.delete(key).then(res => {
                    console.log('삭제완료');
                });
            }
        });

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

        let keyList = null;
        let result = [];

        await db.list().then((res) => {
            keyList = res;
            console.log(keyList);
        });

        for (let key of keyList) {
            await db.get(key).then((data) => {
                console.log(data);
                if (data.isComplete === true && data.date !== undefined) {

                    let lPoint = 0;
                    let rPoint = 0;

                    const player1 = data.player1;
                    const player2 = data.player2;

                    if (player1.id === data.firstGameWinner) {
                        lPoint++;
                    } else {
                        rPoint++;
                    }

                    if (player1.id === data.secondGameWinner) {
                        lPoint++;
                    } else {
                        rPoint++;
                    }

                    if (data.thirdGameWinner !== undefined) {
                        if (player1.id === data.thirdGameWinner) {
                            lPoint++;
                        } else {
                            rPoint++;
                        }
                    }

                    let description = null;
                    let name = null;

                    if (lPoint >= 2) {
                        name = `${data.date}, 승리: ${data.player1.username})`;
                        description = `대진: ${data.player1.username} vs ${data.player2.username}, 스코어: [${lPoint} : ${rPoint}]`;
                    } else {
                        name = `${data.date}, 승리: ${data.player2.username})`;
                        description = `대진: ${data.player1.username} vs ${data.player2.username}, 스코어: [${lPoint} : ${rPoint}]`;
                    }

                    const content = {
                        'name': name,
                        'value': description
                    }

                    result.push(content);
                }
            });
        }

        let matchList = new EmbedBuilder()
            .setColor('Red')
            .setTitle('매치 결과조회')
            .setDescription('최근 10개의 매치결과입니다.')
            .setTimestamp();

        result.forEach(item => {
            matchList.addFields(item);
        });

        interaction.reply({ embeds: [matchList] });
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

        const key = 'temp_' + v4().replaceAll('-', '');
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

        const guildId = interaction.guildId;
        const guild = await client.guilds.fetch(guildId);
        const users = await guild.members.fetch();

        let options = [];

        // 현재 유저목록 불러오기
        users.forEach(item => {
            let object = {};
            // if (item.bot === false) {
            object.label = item.user.username;
            object.value = item.user.id;
            options.push(object);
            // }
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

    if (!interaction.isStringSelectMenu()) {
        return;
    }

    if (interaction.customId.split('||')[0] === 'selectPlayer1') {

        const key = interaction.customId.split('||')[1];

        const guildId = interaction.guildId;
        const guild = await client.guilds.fetch(guildId);
        const users = await guild.members.fetch();

        const user = users.get(interaction.values[0]).user;
        console.log(user);
        console.log(key);
        await db.get(key).then((res) => {
            console.log('sp1 res', res);
            res.player1 = user;
            db.set(key, res);
        });
        
        let options = [];

        users.forEach(item => {
            let object = {};
            //if (item.bot === false) {
            object.label = item.user.username;
            object.value = item.user.id;
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

        const key = interaction.customId.split('||')[1];

        const guildId = interaction.guildId;
        const guild = await client.guilds.fetch(guildId);
        const users = await guild.members.fetch();
        
        const user = users.get(interaction.values[0]).user;
        let selectUsers = null;

        await db.get(key).then((res) => {
            res.player2 = user;
            selectUsers = res;
            db.set(key, res);
        });

        let options = [];

        options.push(selectMemberData(selectUsers.player1));
        options.push(selectMemberData(selectUsers.player2));

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

        let selectUsers = null;
        const key = interaction.customId.split('||')[1];

        await db.get(key).then((res) => {
            res.firstGameWinner = interaction.values[0];
            selectUsers = res;
            db.set(key, res);
        });

        let options = [];

        options.push(selectMemberData(selectUsers.player1));
        options.push(selectMemberData(selectUsers.player2));

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

        let selectUsers = null;
        const key = interaction.customId.split('||')[1];

        await db.get(key).then(res => {
            res.secondGameWinner = interaction.values[0];
            selectUsers = res;
            db.set(key, res);
        });

        if (selectUsers.firstGameWinner === selectUsers.secondGameWinner) {

            const nowMoment = moment(new Date);
            const today = nowMoment.format('YYYY/MM/DD HH:mm:ss');
            const timestamp = nowMoment.format('YYYYMMDDHHmmss');

            let matchResult = null;
            let winnerId = null;
            
            await db.get(key).then((res) => {
                res.isComplete = true;
                res.date = today;
                selectUsers = res;

                if (res.player1.id === res.firstGameWinner) {
                    winnerId = res.player1.id;
                    matchResult = `${res.player1.username} 🔥`;
                } else {
                    winnerId = res.player2.id;
                    matchResult = `${res.player2.username} 🔥`;
                }

                let simplify = {
                    'p1_id': res.player1.id,
                    'p1_name': res.player1.username,
                    'p2_id': res.player2.id,
                    'p2_name': res.player2.username,
                    'winner': winnerId
                }

                const realKey = `${timestamp}||${JSON.stringify(simplify)}`;
                db.set(realKey, res);
            });

            let winP = null;

            if (selectUsers.player1.id === selectUsers.firstGameWinner) {
                winP = selectUsers.player1;
            } else {
                winP = selectUsers.player2;
            }
            
            const player1 = selectMemberData(selectUsers.player1).label;
            const player2 = selectMemberData(selectUsers.player2).label;
            const winnerLabel = selectMemberData(winP).label;

            const exampleEmbed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('저장된 매치결과')
                .setDescription(today)
                .addFields(
                    { name: '매치업', value: `${player1} vs ${player2}` },
                    { name: '1세트: ' + selectUsers.maps[0].label, value: winnerLabel },
                    { name: '2세트: ' + selectUsers.maps[1].label, value: winnerLabel },
                    { name: '3세트: ' + selectUsers.maps[2].label, value: '경기없음' },
                    { name: '승자', value: matchResult },
                )
                .setTimestamp();

            interaction.reply({ embeds: [exampleEmbed] });
        } else {

            let options = [];

            options.push(selectMemberData(selectUsers.player1));
            options.push(selectMemberData(selectUsers.player2));

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
        const nowMoment = moment(new Date);
        const today = nowMoment.format('YYYY/MM/DD HH:mm:ss');
        const timestamp = nowMoment.format('YYYYMMDDHHmmss');

        let selectUsers = null;

        await db.get(key).then((res) => {
            res.thirdGameWinner = interaction.values[0];
            res.isComplete = true;
            res.date = today;
            selectUsers = res;

            let winnerId = null;

            if (res.player1.id === res.thirdGameWinner) {
                winnerId = res.player1.id;
            } else {
                winnerId = res.player2.id;
            }

            let simplify = {
                'p1_id': res.player1.id,
                'p1_name': res.player1.username,
                'p2_id': res.player2.id,
                'p2_name': res.player2.username,
                'winner': winnerId
            }

            const realKey = `${timestamp}||${JSON.stringify(simplify)}`;
            db.set(realKey, res);
        });

        const player1 = selectMemberData(selectUsers.player1).label;
        const player2 = selectMemberData(selectUsers.player2).label;

        let fWinP = null;
        let sWinP = null;
        let tWinP = null;
        
        if (selectUsers.player1.id === selectUsers.firstGameWinner) {
            fWinP = selectUsers.player1;
        } else {
            fWinP = selectUsers.player2;
        }

        if (selectUsers.player1.id === selectUsers.secondGameWinner) {
            sWinP = selectUsers.player1;
        } else {
            sWinP = selectUsers.player2;
        }

        if (selectUsers.player1.id === selectUsers.thirdGameWinner) {
            tWinP = selectUsers.player1;
            matchResult = `${player1} 🔥`;
        } else {
            tWinP = selectUsers.player2;
            matchResult = `${player2} 🔥`;
        }
        
        const fWinner = selectMemberData(fWinP).label;
        const sWinner = selectMemberData(sWinP).label;
        const tWinner = selectMemberData(tWinP).label;

        const exampleEmbed = new EmbedBuilder()
            .setColor('Red')
            .setTitle('저장된 매치결과')
            .setDescription(today)
            .addFields(
                { name: '매치업', value: `${player1} vs ${player2}` },
                { name: '1세트: ' + selectUsers.maps[0].label, value: fWinner },
                { name: '2세트: ' + selectUsers.maps[1].label, value: sWinner },
                { name: '3세트: ' + selectUsers.maps[2].label, value: tWinner },
                { name: '승자', value: matchResult },
            )
            .setTimestamp();

        interaction.reply({ embeds: [exampleEmbed] });
    }
});

client.login(token);

function selectMemberData(member) {

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

