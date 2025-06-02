class ComparisonScene extends Phaser.Scene {
    constructor() {
        super('ComparisonScene');
        this.suspect1Statements = [];
        this.suspect2Statements = [];
        this.analysisResult = null;
        this.isAnalyzing = false;
    }

    init() {
        // 获取两个嫌疑人的审讯记录
        this.suspect1Statements = this.game.gameState.suspect1Interrogation || [];
        this.suspect2Statements = this.game.gameState.suspect2Interrogation || [];
    }

    create() {
        // 设置背景
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // 添加标题
        this.add.text(
            this.cameras.main.width / 2,
            30,
            '供词比对',
            { fontSize: '32px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // 创建嫌疑人供词区域
        this.createStatementsArea();

        // 创建分析结果区域
        this.createAnalysisArea();

        // 创建控制按钮
        this.createControlButtons();

        // 显示嫌疑人供词
        this.displayStatements();
    }

    /**
     * 创建嫌疑人供词区域
     */
    createStatementsArea() {
        // 嫌疑人1供词区域
        this.add.rectangle(
            this.cameras.main.width / 4,
            200,
            this.cameras.main.width / 2 - 20,
            300,
            0x222222,
            0.7
        ).setOrigin(0.5);

        // 嫌疑人1标题
        this.add.text(
            this.cameras.main.width / 4,
            80,
            `${config.suspects.suspect1.name}的供词`,
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5);

        // 嫌疑人1供词内容
        this.suspect1Text = this.add.text(
            this.cameras.main.width / 4 - 180,
            100,
            '',
            { fontSize: '16px', fill: '#fff', wordWrap: { width: 360 } }
        );

        // 嫌疑人2供词区域
        this.add.rectangle(
            this.cameras.main.width * 3 / 4,
            200,
            this.cameras.main.width / 2 - 20,
            300,
            0x222222,
            0.7
        ).setOrigin(0.5);

        // 嫌疑人2标题
        this.add.text(
            this.cameras.main.width * 3 / 4,
            80,
            `${config.suspects.suspect2.name}的供词`,
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5);

        // 嫌疑人2供词内容
        this.suspect2Text = this.add.text(
            this.cameras.main.width * 3 / 4 - 180,
            100,
            '',
            { fontSize: '16px', fill: '#fff', wordWrap: { width: 360 } }
        );
    }

    /**
     * 创建分析结果区域
     */
    createAnalysisArea() {
        // 分析结果区域
        this.add.rectangle(
            this.cameras.main.width / 2,
            450,
            this.cameras.main.width - 40,
            150,
            0x333333,
            0.8
        ).setOrigin(0.5);

        // 分析结果标题
        this.add.text(
            this.cameras.main.width / 2,
            380,
            '矛盾点分析',
            { fontSize: '24px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(0.5);

        // 分析结果内容
        this.analysisText = this.add.text(
            40,
            400,
            '点击"分析矛盾点"按钮开始分析两名嫌疑人供词中的矛盾之处...',
            { fontSize: '18px', fill: '#fff', wordWrap: { width: this.cameras.main.width - 80 }, lineSpacing: 5 }
        );
    }

    /**
     * 创建控制按钮
     */
    createControlButtons() {
        // 分析矛盾点按钮
        this.createButton(
            this.cameras.main.width / 2 - 100,
            550,
            '分析矛盾点',
            () => this.analyzeContradictions()
        );

        // 返回审讯按钮
        this.createButton(
            this.cameras.main.width / 2 + 100,
            550,
            '返回审讯',
            () => this.returnToInterrogation()
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
            .setDisplaySize(180, 50)
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
                if (this.isAnalyzing) return;
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
            fontSize: '18px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        return { button, buttonText };
    }

    /**
     * 显示嫌疑人供词
     */
    displayStatements() {
        // 显示嫌疑人1的供词
        let suspect1Content = '';
        this.suspect1Statements.forEach(item => {
            suspect1Content += `问: ${item.question}\n答: ${item.answer}\n\n`;
        });
        this.suspect1Text.setText(suspect1Content || '暂无供词');

        // 显示嫌疑人2的供词
        let suspect2Content = '';
        this.suspect2Statements.forEach(item => {
            suspect2Content += `问: ${item.question}\n答: ${item.answer}\n\n`;
        });
        this.suspect2Text.setText(suspect2Content || '暂无供词');
    }

    /**
     * 分析矛盾点
     */
    async analyzeContradictions() {
        if (this.isAnalyzing) return;
        
        // 检查是否有足够的供词进行分析
        if (this.suspect1Statements.length < 2 || this.suspect2Statements.length < 2) {
            this.analysisText.setText('供词数量不足，无法进行有效分析。请返回审讯获取更多信息。');
            return;
        }

        // 设置分析中状态
        this.isAnalyzing = true;
        this.analysisText.setText('正在分析中，请稍候...');

        try {
            // 将供词对象数组转换为纯文本字符串
            let suspect1Text = '';
            this.suspect1Statements.forEach(item => {
                suspect1Text += `问: ${item.question}\n答: ${item.answer}\n\n`;
            });
            
            let suspect2Text = '';
            this.suspect2Statements.forEach(item => {
                suspect2Text += `问: ${item.question}\n答: ${item.answer}\n\n`;
            });
            
            // 直接调用ZhipuAPI的analyzeContradictions方法，传递纯文本
            const analysis = await this.game.zhipuAPI.analyzeContradictions(
                suspect1Text,
                suspect2Text
            );
            
            // 保存分析结果
            this.analysisResult = analysis;
            this.game.gameState.contradictions = analysis;
            
            // 显示分析结果
            this.analysisText.setText(analysis);
            
            // 播放音效
            try {
                this.sound.play('success');
            } catch (error) {
                console.warn('无法播放音效:', error);
            }
        } catch (error) {
            console.error('分析供词失败:', error);
            this.analysisText.setText(`分析失败: ${error.message}`);
        } finally {
            this.isAnalyzing = false;
        }
    }

    /**
     * 返回审讯场景
     */
    returnToInterrogation() {
        this.scene.start('InterrogationScene', { suspect: this.game.gameState.currentSuspect });
    }
}