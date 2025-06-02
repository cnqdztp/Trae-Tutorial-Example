class InterrogationScene extends Phaser.Scene {
    constructor() {
        super('InterrogationScene');
        this.suspect = null;          // 当前嫌疑人
        this.interrogationHistory = []; // 审讯历史
        this.isWaitingForResponse = false; // 是否正在等待AI响应
    }

    init(data) {
        // 获取当前审讯的嫌疑人
        this.suspect = data.suspect || 'suspect1';
        this.game.gameState.currentSuspect = this.suspect;
        
        // 获取审讯历史
        if (this.suspect === 'suspect1') {
            this.interrogationHistory = this.game.gameState.suspect1Interrogation || [];
        } else {
            this.interrogationHistory = this.game.gameState.suspect2Interrogation || [];
        }
    }

    create() {
        // 设置背景
        this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'background')
            .setDisplaySize(this.cameras.main.width, this.cameras.main.height);

        // 添加嫌疑人图像
        const suspectImage = this.add.image(
            this.cameras.main.width / 2,
            200,
            config.suspects[this.suspect].image
        ).setDisplaySize(200, 300);

        // 添加嫌疑人名称
        this.add.text(
            this.cameras.main.width / 2,
            350,
            config.suspects[this.suspect].name,
            { fontSize: '24px', fill: '#fff' }
        ).setOrigin(0.5);

        // 创建对话历史区域
        this.createDialogueArea();

        // 创建输入区域
        this.createInputArea();

        // 创建控制按钮
        this.createControlButtons();

        // 显示对话历史
        this.displayDialogueHistory();
    }

    /**
     * 创建对话历史区域
     */
    createDialogueArea() {
        // 创建对话历史区域标题
        this.add.text(
            this.cameras.main.width / 2,
            380,
            '对话记录',
            { fontSize: '18px', fill: '#fff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 创建对话历史背景
        const dialogueBackground = this.add.rectangle(
            this.cameras.main.width / 2,
            500,
            this.cameras.main.width - 100,
            200,
            0x000000,
            0.7
        ).setOrigin(0.5);
        
        // 添加边框
        const border = this.add.graphics();
        border.lineStyle(2, 0x4a6fa5, 1);
        border.strokeRect(
            50, 
            400, 
            this.cameras.main.width - 100, 
            200
        );

        // 创建对话历史文本
        this.dialogueText = this.add.text(
            60,
            400,
            '',
            {
                fontSize: '16px',
                fill: '#fff',
                wordWrap: { width: this.cameras.main.width - 120 },
                lineSpacing: 6
            }
        );

        // 设置遮罩以实现滚动效果
        const mask = this.make.graphics();
        mask.fillRect(50, 400, this.cameras.main.width - 100, 200);
        this.dialogueText.setMask(mask.createGeometryMask());
        
        // 当前滚动位置
        this.scrollY = 0;
        
        // 添加滚动指示器
        this.scrollIndicator = this.add.text(
            this.cameras.main.width - 70,
            400,
            '↕️ 滑动',
            { fontSize: '14px', fill: '#aaaaaa' }
        );
        
        // 添加滚动条
        this.scrollBar = this.add.rectangle(
            this.cameras.main.width - 60,
            500,
            8,
            50,
            0x4a6fa5,
            1
        ).setOrigin(0.5, 0.5);
        this.scrollBar.visible = false;
        
        // 添加鼠标滚轮事件
        this.input.on('wheel', (pointer, gameObjects, deltaX, deltaY, deltaZ) => {
            if (pointer.y >= 400 && pointer.y <= 600) {
                this.scrollDialogue(deltaY * 0.5);
            }
        });
        
        // 添加拖拽滚动功能
        dialogueBackground.setInteractive({ useHandCursor: true, draggable: true })
            .on('dragstart', (pointer) => {
                this.dragStartY = pointer.y;
                this.startScrollY = this.scrollY;
            })
            .on('drag', (pointer) => {
                const deltaY = this.dragStartY - pointer.y;
                this.scrollDialogue(deltaY * 0.5, false);
                this.dragStartY = pointer.y;
            });
    }

    /**
     * 创建输入区域
     */
    createInputArea() {
        // 不再需要输入区域，因为玩家可以直接点击提问按钮
        // 创建一个隐藏的文本对象用于状态显示
        this.inputText = this.add.text(
            -1000, // 放在屏幕外
            -1000,
            '',
            { fontSize: '18px', fill: '#fff' }
        ).setVisible(false);
    }

    /**
     * 创建控制按钮
     */
    createControlButtons() {
        // 创建提问按钮 - 更大更突出
        this.createButton(
            this.cameras.main.width / 2,
            this.cameras.main.height - 70,
            '提问',
            () => {
                if (this.isWaitingForResponse) return;
                
                // 显示输入对话框
                const question = prompt('输入你的问题:', '');
                if (question && question.trim() !== '') {
                    this.askQuestion(question);
                }
            },
            220, // 更宽
            60,  // 更高
            '20px' // 更大的字体
        );

        // 创建切换嫌疑人按钮
        this.createButton(
            this.cameras.main.width / 2 - 200,
            this.cameras.main.height - 50,
            '切换嫌疑人',
            () => this.switchSuspect()
        );

        // 创建比对供词按钮
        this.createButton(
            this.cameras.main.width / 2 + 200,
            this.cameras.main.height - 50,
            '比对供词',
            () => this.compareStatements()
        );
    }

    /**
     * 创建按钮
     * @param {number} x - 按钮x坐标
     * @param {number} y - 按钮y坐标
     * @param {string} text - 按钮文本
     * @param {function} callback - 点击回调函数
     * @param {number} width - 按钮宽度，默认180
     * @param {number} height - 按钮高度，默认50
     * @param {string} fontSize - 字体大小，默认'18px'
     */
    createButton(x, y, text, callback, width = 180, height = 50, fontSize = '18px') {
        // 创建按钮背景
        const button = this.add.image(x, y, 'button')
            .setDisplaySize(width, height)
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
                if (this.isWaitingForResponse) return;
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
            fontSize: fontSize,
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        return { button, buttonText };
    }

    /**
     * 显示对话历史
     */
    displayDialogueHistory() {
        let dialogueContent = '';
        
        this.interrogationHistory.forEach(entry => {
            dialogueContent += `警察: ${entry.question}\n${config.suspects[this.suspect].name}: ${entry.answer}\n\n`;
        });
        
        this.dialogueText.setText(dialogueContent || '开始审讯...');
        
        // 计算文本高度
        const textHeight = this.dialogueText.height;
        const visibleHeight = 200; // 可见区域高度
        
        // 如果文本高度大于可见区域，显示滚动条
        if (textHeight > visibleHeight) {
            this.scrollBar.visible = true;
            this.scrollIndicator.visible = true;
            
            // 自动滚动到底部
            const maxScroll = textHeight - visibleHeight;
            this.scrollDialogue(maxScroll, true);
        } else {
            this.scrollBar.visible = false;
            this.scrollIndicator.visible = false;
            this.scrollY = 0;
            this.dialogueText.y = 400; // 重置位置
        }
    }
    
    /**
     * 滚动对话历史
     * @param {number} delta - 滚动增量
     * @param {boolean} absolute - 是否为绝对位置
     */
    scrollDialogue(delta, absolute = false) {
        const textHeight = this.dialogueText.height;
        const visibleHeight = 200; // 可见区域高度
        
        // 如果文本高度小于可见区域，不需要滚动
        if (textHeight <= visibleHeight) {
            this.scrollY = 0;
            this.dialogueText.y = 400;
            this.scrollBar.visible = false;
            this.scrollIndicator.visible = false;
            return;
        }
        
        // 计算最大滚动距离
        const maxScroll = textHeight - visibleHeight;
        
        // 更新滚动位置
        if (absolute) {
            this.scrollY = delta;
        } else {
            this.scrollY += delta;
        }
        
        // 限制滚动范围
        this.scrollY = Math.max(0, Math.min(this.scrollY, maxScroll));
        
        // 更新文本位置
        this.dialogueText.y = 400 - this.scrollY;
        
        // 更新滚动条位置
        const scrollBarHeight = 50;
        const scrollBarTravel = 200 - scrollBarHeight;
        const scrollBarY = 400 + (this.scrollY / maxScroll) * scrollBarTravel;
        this.scrollBar.y = scrollBarY + scrollBarHeight / 2;
    }

    /**
     * 处理提问
     */
    async askQuestion(question) {
        if (this.isWaitingForResponse) return;
        
        this.isWaitingForResponse = true;
        
        // 显示加载动画
        const loadingText = this.add.text(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            '正在思考...',
            { fontSize: '24px', fill: '#ffffff', fontStyle: 'bold' }
        ).setOrigin(0.5);
        
        // 添加简单的动画效果
        this.tweens.add({
            targets: loadingText,
            alpha: { from: 1, to: 0.5 },
            duration: 500,
            yoyo: true,
            repeat: -1
        });
        
        // 添加加载背景
        const loadingBg = this.add.rectangle(
            this.cameras.main.width / 2,
            this.cameras.main.height / 2,
            300,
            80,
            0x000000,
            0.7
        ).setOrigin(0.5);
        
        try {
            // 构建对话历史用于API请求
            const dialogueHistory = this.interrogationHistory.map(entry => {
                return {
                    role: 'user',
                    content: entry.question
                };
            });
            
            // 添加当前问题
            dialogueHistory.push({
                role: 'user',
                content: question
            });
            
            // 调用API获取回答
            const response = await this.game.zhipuAPI.interrogateSuspect(
                this.suspect,  // 嫌疑人类型
                dialogueHistory,  // 对话历史
                question  // 当前问题
            );
            
            // 添加到审讯历史
            this.interrogationHistory.push({
                question: question,
                answer: response
            });
            
            // 移除加载动画
            loadingText.destroy();
            loadingBg.destroy();
            
            // 更新显示
            this.displayDialogueHistory();
            
            // 播放音效
            try {
                this.sound.play('success');
            } catch (error) {
                console.warn('无法播放音效:', error);
            }
            
            // 确保滚动到最新消息
            const textHeight = this.dialogueText.height;
            const visibleHeight = 200;
            if (textHeight > visibleHeight) {
                const maxScroll = textHeight - visibleHeight;
                this.scrollDialogue(maxScroll, true);
            }
        } catch (error) {
            console.error('获取回答失败:', error);
            // 移除加载动画
            loadingText.destroy();
            loadingBg.destroy();
            
            // 显示错误消息
            const errorText = this.add.text(
                this.cameras.main.width / 2,
                this.cameras.main.height / 2,
                '获取回答失败，请重试',
                { fontSize: '20px', fill: '#ff0000', fontStyle: 'bold' }
            ).setOrigin(0.5);
            
            // 3秒后自动消失
            this.time.delayedCall(3000, () => {
                errorText.destroy();
            });
        } finally {
            this.isWaitingForResponse = false;
        }
    }

    /**
     * 切换嫌疑人
     */
    switchSuspect() {
        // 保存当前审讯历史
        if (this.suspect === 'suspect1') {
            this.game.gameState.suspect1Interrogation = this.interrogationHistory;
            this.scene.start('InterrogationScene', { suspect: 'suspect2' });
        } else {
            this.game.gameState.suspect2Interrogation = this.interrogationHistory;
            this.scene.start('InterrogationScene', { suspect: 'suspect1' });
        }
    }

    /**
     * 比对供词
     */
    compareStatements() {
        // 检查是否已经审讯了两个嫌疑人
        if (this.game.gameState.suspect1Interrogation.length === 0 ||
            this.game.gameState.suspect2Interrogation.length === 0) {
            alert('请先完成对两名嫌疑人的审讯');
            return;
        }
        
        // 保存当前审讯历史
        if (this.suspect === 'suspect1') {
            this.game.gameState.suspect1Interrogation = this.interrogationHistory;
        } else {
            this.game.gameState.suspect2Interrogation = this.interrogationHistory;
        }
        
        // 跳转到比对场景
        this.scene.start('ComparisonScene');
    }
}