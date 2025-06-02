class ResultScene extends Phaser.Scene {
    constructor() {
        super('ResultScene');
    }

    create() {
        // 设置背景
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // 添加标题
        this.add.text(
            this.cameras.main.width / 2,
            50,
            '审讯结果',
            { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // 添加案件信息
        this.add.text(
            this.cameras.main.width / 2,
            100,
            `案件: ${config.caseBackground.title}`,
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5);

        // 显示结果内容
        this.displayResults();

        // 创建控制按钮
        this.createControlButtons();
    }

    /**
     * 显示结果内容
     */
    displayResults() {
        // 创建结果区域背景
        this.add.rectangle(
            this.cameras.main.width / 2,
            300,
            this.cameras.main.width - 100,
            300,
            0x000000,
            0.7
        ).setOrigin(0.5);

        // 获取矛盾点分析结果
        const contradictions = this.game.gameState.contradictions || '未找到明显矛盾点。';

        // 添加结果文本
        this.add.text(
            this.cameras.main.width / 2,
            150,
            '分析结果:',
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5);

        this.add.text(
            60,
            180,
            contradictions,
            {
                fontSize: '18px',
                fill: '#fff',
                wordWrap: { width: this.cameras.main.width - 120 },
                lineSpacing: 6
            }
        );

        // 添加结论
        let conclusion;
        if (contradictions.length > 100) {
            conclusion = '你成功找出了嫌疑人供词中的矛盾点！';
        } else {
            conclusion = '你需要更深入地审讯嫌疑人，找出更多矛盾点。';
        }

        this.add.text(
            this.cameras.main.width / 2,
            450,
            conclusion,
            { fontSize: '24px', fill: '#ffff00' }
        ).setOrigin(0.5);
    }

    /**
     * 创建控制按钮
     */
    createControlButtons() {
        // 创建返回主菜单按钮
        this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 50,
            '返回主菜单',
            () => this.scene.start('MainMenuScene')
        );
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
            .setDisplaySize(200, 50)
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
            fontSize: '20px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        return { button, buttonText };
    }

    /**
     * 显示游戏结果
     */
    showGameResult() {
        // 根据游戏进度显示不同结果
        const gameProgress = this.game.gameState.gameProgress || 0;
        
        let resultText;
        if (gameProgress > 80) {
            resultText = '你成功破解了案件！';
        } else if (gameProgress > 50) {
            resultText = '你找到了一些线索，但还不足以破案。';
        } else {
            resultText = '你没有找到足够的线索，案件仍未解决。';
        }
        
        this.add.text(
            this.cameras.main.width / 2,
            500,
            resultText,
            { fontSize: '28px', fill: '#ffff00', fontStyle: 'bold' }
        ).setOrigin(0.5);
    }
}