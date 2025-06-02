/**
 * 引导场景 - 负责加载游戏资源并初始化游戏
 */
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene');
    }

    preload() {
        // 创建加载进度条
        const progressBar = this.add.graphics();
        const progressBox = this.add.graphics();
        progressBox.fillStyle(0x222222, 0.8);
        progressBox.fillRect(240, 270, 320, 50);
        
        const width = this.cameras.main.width;
        const height = this.cameras.main.height;
        const loadingText = this.make.text({
            x: width / 2,
            y: height / 2 - 50,
            text: '加载中...',
            style: {
                font: '20px monospace',
                fill: '#ffffff'
            }
        });
        loadingText.setOrigin(0.5, 0.5);
        
        const percentText = this.make.text({
            x: width / 2,
            y: height / 2 - 5,
            text: '0%',
            style: {
                font: '18px monospace',
                fill: '#ffffff'
            }
        });
        percentText.setOrigin(0.5, 0.5);
        
        // 监听加载进度
        this.load.on('progress', function (value) {
            percentText.setText(parseInt(value * 100) + '%');
            progressBar.clear();
            progressBar.fillStyle(0xffffff, 1);
            progressBar.fillRect(250, 280, 300 * value, 30);
        });
        
        this.load.on('complete', function () {
            progressBar.destroy();
            progressBox.destroy();
            loadingText.destroy();
            percentText.destroy();
        });
        
        // 加载游戏资源
        this.loadAssets();
    }

    /**
     * 加载游戏所需的资源
     */
    loadAssets() {
        // 加载图片资源
        this.load.image('suspect_1', 'image/characters/suspect_1.png');
        this.load.image('suspect_2', 'image/characters/suspect_2.png');
        this.load.image('background', 'image/room/background.png');
        
        // 加载UI资源 - 使用本地SVG文件替代外部资源
        this.load.image('button', 'image/ui/blue_button01.svg');
        this.load.image('button_hover', 'image/ui/blue_button02.svg');
        
        // 注册加载错误处理
        this.load.on('loaderror', (fileObj) => {
            console.warn('加载资源失败:', fileObj.src);
            // 如果是音频文件加载失败，创建一个空的音频对象作为替代
            if (fileObj.type === 'audio') {
                this.cache.audio.add(fileObj.key, { duration: 0.1, locked: false });
            }
        });
        
        // 尝试加载音效 - 使用SVG占位符，实际项目中应使用真实音频文件
        // 由于我们使用的是SVG占位符而不是真实音频，这些加载会失败
        // 但我们已经添加了错误处理逻辑来防止游戏崩溃
        this.load.audio('click', 'image/audio/click.svg');
        this.load.audio('success', 'image/audio/success.svg');
        
        // 加载JSON数据文件
        this.load.json('crime_memory', config.aiPrompts.dataFiles.crimeMemory);
        this.load.json('suspect1', config.aiPrompts.dataFiles.suspect1);
        this.load.json('suspect2', config.aiPrompts.dataFiles.suspect2);
    }

    create() {
        // 显示加载完成文本
        const text = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            '资源加载完成，点击开始游戏',
            { fontSize: '24px', fill: '#fff' }
        );
        text.setOrigin(0.5);
        
        // 为音频加载失败创建替代方案
        this.createAudioFallbacks();
        
        // 初始化游戏状态
        this.initGameState();
        
        // 添加点击事件，跳转到主菜单场景
        this.input.on('pointerdown', () => {
            this.scene.start('MainMenuScene');
        });
        
        // 初始化API
        this.game.zhipuAPI.loadApiKey().then(() => {
            console.log('API初始化完成');
            // 加载嫌疑人数据
            return this.game.zhipuAPI.loadPersonalityData();
        }).then(() => {
            console.log('嫌疑人数据加载完成');
        }).catch(error => {
            console.error('API或数据初始化失败:', error);
            this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2 + 50,
                'API或数据初始化失败，请检查配置文件',
                { fontSize: '18px', fill: '#ff0000' }
            ).setOrigin(0.5);
        });
    }
    
    /**
     * 初始化游戏状态
     */
    initGameState() {
        // 创建游戏状态对象
        this.game.gameState = {
            // 当前审讯的嫌疑人
            currentSuspect: null,
            
            // 嫌疑人1的审讯记录
            suspect1Interrogation: [],
            
            // 嫌疑人2的审讯记录
            suspect2Interrogation: [],
            
            // 矛盾点分析结果
            contradictionAnalysis: null,
            
            // 嫌疑人数据
            suspectData: {
                suspect1: this.cache.json.get('suspect1'),
                suspect2: this.cache.json.get('suspect2')
            },
            
            // 犯罪记忆数据
            crimeMemory: this.cache.json.get('crime_memory')
        };
        
        console.log('游戏状态初始化完成');
    }
    
    /**
     * 为音频加载失败创建替代方案
     */
    createAudioFallbacks() {
        // 检查音频是否已加载，如果没有则创建模拟音频对象
        if (!this.cache.audio.exists('click')) {
            // 创建一个模拟的音频管理器方法
            this.sound.play = function(key, config) {
                console.log(`播放音效: ${key}`);
                // 返回一个模拟的音频对象
                return {
                    stop: function() {},
                    destroy: function() {}
                };
            };
            console.warn('音频资源加载失败，使用静音模式');
        }
    }
}