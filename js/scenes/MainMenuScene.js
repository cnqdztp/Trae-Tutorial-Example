/**
 * 主菜单场景 - 游戏的开始界面
 */
class MainMenuScene extends Phaser.Scene {
    constructor() {
        super('MainMenuScene');
    }

    create() {
        // 设置背景
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // 添加游戏标题
        const title = this.add.text(
            this.cameras.main.width / 2,
            100,
            'Interrogate',
            { fontSize: '64px', fill: '#fff', fontStyle: 'bold' }
        );
        title.setOrigin(0.5);

        // 添加副标题
        const subtitle = this.add.text(
            this.cameras.main.width / 2,
            170,
            '警察审讯游戏',
            { fontSize: '32px', fill: '#fff' }
        );
        subtitle.setOrigin(0.5);

        // 创建开始游戏按钮
        this.createButton(
            this.cameras.main.width / 2,
            300,
            '开始审讯',
            () => this.startGame()
        );

        // 创建游戏说明按钮
        this.createButton(
            this.cameras.main.width / 2,
            380,
            '游戏说明',
            () => this.showInstructions()
        );

        // 添加案件背景信息
        const caseInfo = this.add.text(
            this.cameras.main.width / 2,
            500,
            `案件: ${config.caseBackground.title}\n${config.caseBackground.description}`,
            { fontSize: '18px', fill: '#fff', align: 'center', wordWrap: { width: 600 } }
        );
        caseInfo.setOrigin(0.5);

        // 添加版权信息
        const copyright = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height - 20,
            '© 2023 Interrogate Game',
            { fontSize: '16px', fill: '#888' }
        );
        copyright.setOrigin(0.5);
    }

    /**
     * 创建按钮
     * @param {number} x - 按钮x坐标
     * @param {number} y - 按钮y坐标
     * @param {string} text - 按钮文本
     * @param {function} callback - 点击回调函数
     */
    createButton(x, y, text, callback) {
        // 创建按钮背景
        const button = this.add.image(x, y, 'button')
            .setDisplaySize(250, 60)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                button.setTexture('button_hover');
                buttonText.setColor('#000000');
            })
            .on('pointerout', () => {
                button.setTexture('button');
                buttonText.setColor('#ffffff');
            })
            .on('pointerdown', () => {
                // 尝试播放音效，但不阻止回调执行
                try {
                    this.sound.play('click');
                } catch (error) {
                    console.warn('无法播放音效:', error);
                }
                callback();
            });

        // 创建按钮文本
        const buttonText = this.add.text(x, y, text, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        return { button, buttonText };
    }

    /**
     * 开始游戏
     */
    startGame() {
        // 重置游戏状态
        this.game.gameState = {
            suspect1Interrogation: [],
            suspect2Interrogation: [],
            currentSuspect: 'suspect1', // 默认从嫌疑人1开始
            contradictions: [],
            gameProgress: 0
        };

        // 跳转到审讯场景
        this.scene.start('InterrogationScene', { suspect: 'suspect1' });
    }

    /**
     * 显示游戏说明
     */
    showInstructions() {
        // 创建半透明背景
        const overlay = this.add.rectangle(
            0, 0,
            this.cameras.main.width * 2,
            this.cameras.main.height * 2,
            0x000000, 0.7
        ).setOrigin(0);

        // 创建说明面板
        const panel = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            600, 400,
            0x333333, 0.9
        ).setOrigin(0.5);

        // 添加说明标题
        const title = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 160,
            '游戏说明',
            { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // 添加说明内容
        const instructions = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 - 50,
            '1. 你是一名警察，需要审讯两名嫌疑人\n' +
            '2. 每个嫌疑人都是AI扮演的，拥有相同的犯罪记忆\n' +
            '3. 你需要分别询问他们问题，寻找供述中的矛盾\n' +
            '4. 审讯完两名嫌疑人后，你可以比对他们的供述\n' +
            '5. 找出矛盾点，揭穿他们的谎言\n' +
            '6. 成功找出关键矛盾点即可赢得游戏',
            { fontSize: '18px', fill: '#fff', align: 'left', lineSpacing: 10 }
        ).setOrigin(0.5, 0);

        // 添加关闭按钮
        const closeButton = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2 + 150,
            '关闭',
            { fontSize: '24px', fill: '#fff', backgroundColor: '#555', padding: { left: 20, right: 20, top: 10, bottom: 10 } }
        ).setOrigin(0.5)
            .setInteractive({ useHandCursor: true })
            .on('pointerover', () => closeButton.setStyle({ fill: '#ff0' }))
            .on('pointerout', () => closeButton.setStyle({ fill: '#fff' }))
            .on('pointerdown', () => {
                // 尝试播放音效，但不阻止回调执行
                try {
                    this.sound.play('click');
                } catch (error) {
                    console.warn('无法播放音效:', error);
                }
                overlay.destroy();
                panel.destroy();
                title.destroy();
                instructions.destroy();
                closeButton.destroy();
            });
    }
}