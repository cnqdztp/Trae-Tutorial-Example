/**
 * 游戏配置文件
 */
const config = {
    // 游戏基本设置
    width: 800,
    height: 600,
    backgroundColor: '#333333',
    
    // 游戏场景
    scenes: [
        'BootScene',
        'MainMenuScene',
        'InterrogationScene',
        'ComparisonScene',
        'ResultScene'
    ],
    
    // 角色设置
    suspects: {
        suspect1: {
            name: '张明',
            image: 'suspect_1',
            description: '第一位嫌疑人，看起来紧张且话多'
        },
        suspect2: {
            name: '李强',
            image: 'suspect_2',
            description: '第二位嫌疑人，表现冷静且沉稳'
        }
    },
    
    // 案件背景信息 - 这是两个嫌疑人共享的记忆
    caseBackground: {
        title: '珠宝店盗窃案',
        description: '昨晚10点左右，市中心的明珠珠宝店发生盗窃案，价值约50万元的珠宝被盗。监控显示有两名嫌疑人作案，但面部被遮挡。'
    },
    
    // AI提示词设置
    aiPrompts: {
        systemPrompt: '你是一个嫌疑人，被警察审讯关于珠宝店盗窃案。你和你的同伙确实偷了珠宝，但你会尽量掩饰或者说谎，同时保持一定的逻辑一致性。你不会轻易承认犯罪，会编造不在现场的证据。记住，你和同伙的故事应该基本一致，但可能在细节上有差异。',
        // 注意：crimeFacts现在从crime_memory.json加载
        dataFiles: {
            crimeMemory: 'js/data/crime_memory.json',
            suspect1: 'js/data/suspect1_personality.json',
            suspect2: 'js/data/suspect2_personality.json'
        }
    },
    
    // 智谱AI配置
    zhipuAI: {
        model: 'glm-4-plus',
        temperature: 0.7,
        maxTokens: 1000
    }
};