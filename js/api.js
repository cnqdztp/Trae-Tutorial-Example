/**
 * API交互模块 - 处理与智谱AI的通信
 */
class ZhipuAPI {
    constructor() {
        this.apiKey = null;
        this.baseUrl = 'https://open.bigmodel.cn/api/paas/v4/chat/completions';
        this.model = config.zhipuAI.model;
        this.loadApiKey();
        this.crimeMemory = null;
        this.suspect1Personality = null;
        this.suspect2Personality = null;
        this.loadPersonalityData();
    }

    /**
     * 从key.ini文件加载API密钥
     */
    async loadApiKey() {
        try {
            const response = await fetch('key.ini');
            if (!response.ok) {
                throw new Error('无法加载API密钥文件');
            }
            this.apiKey = await response.text();
            this.apiKey = this.apiKey.trim();
            console.log('API密钥加载成功');
        } catch (error) {
            console.error('加载API密钥失败:', error);
            alert('无法加载API密钥，请确保key.ini文件存在且包含有效的密钥');
        }
    }

    /**
     * 加载嫌疑人性格和犯罪记忆数据
     */
    async loadPersonalityData() {
        try {
            // 加载犯罪记忆
            const crimeResponse = await fetch(config.aiPrompts.dataFiles.crimeMemory);
            if (!crimeResponse.ok) {
                throw new Error('无法加载犯罪记忆数据');
            }
            this.crimeMemory = await crimeResponse.json();
            
            // 加载嫌疑人1性格
            const suspect1Response = await fetch(config.aiPrompts.dataFiles.suspect1);
            if (!suspect1Response.ok) {
                throw new Error('无法加载嫌疑人1性格数据');
            }
            this.suspect1Personality = await suspect1Response.json();
            
            // 加载嫌疑人2性格
            const suspect2Response = await fetch(config.aiPrompts.dataFiles.suspect2);
            if (!suspect2Response.ok) {
                throw new Error('无法加载嫌疑人2性格数据');
            }
            this.suspect2Personality = await suspect2Response.json();
            
            console.log('嫌疑人数据加载成功');
        } catch (error) {
            console.error('加载嫌疑人数据失败:', error);
            alert('无法加载嫌疑人数据，请确保数据文件存在且格式正确');
        }
    }

    /**
     * 生成JWT令牌用于API认证
     */
    generateJWT() {
        // 实际项目中应在服务器端生成JWT以保护API密钥
        // 这里为了演示，简化处理
        return this.apiKey;
    }

    /**
     * 向智谱AI发送对话请求
     * @param {Array} messages - 对话历史消息数组
     * @param {Object} options - 请求选项
     * @returns {Promise} - 返回AI响应
     */
    async sendMessage(messages, options = {}) {
        if (!this.apiKey) {
            await this.loadApiKey();
            if (!this.apiKey) {
                throw new Error('API密钥未加载，无法发送请求');
            }
        }

        const requestOptions = {
            model: options.model || this.model,
            messages: messages,
            temperature: options.temperature || config.zhipuAI.temperature,
            max_tokens: options.maxTokens || config.zhipuAI.maxTokens
        };

        try {
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.generateJWT()}`
                },
                body: JSON.stringify(requestOptions)
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`API请求失败: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            return data.choices[0].message.content;
        } catch (error) {
            console.error('API请求错误:', error);
            throw error;
        }
    }

    /**
     * 创建嫌疑人对话 - 根据系统提示和案件事实生成对话
     * @param {String} suspectType - 嫌疑人类型标识
     * @param {Array} interrogationHistory - 之前的审讯历史
     * @param {String} question - 警察提出的问题
     * @returns {Promise} - 返回嫌疑人的回答
     */
    async interrogateSuspect(suspectType, interrogationHistory, question) {
        // 确保数据已加载
        if (!this.crimeMemory || !this.suspect1Personality || !this.suspect2Personality) {
            await this.loadPersonalityData();
        }
        
        // 获取当前嫌疑人的性格数据
        const personalityData = suspectType === 'suspect1' ? 
            this.suspect1Personality : this.suspect2Personality;
        
        // 构建完整的对话历史
        const messages = [
            {
                role: 'system',
                content: `${config.aiPrompts.systemPrompt}\n\n你是${personalityData.name}，${suspectType === 'suspect1' ? '第一个' : '第二个'}嫌疑人。\n\n` +
                `你的性格特点：${personalityData.personality.traits.join('、')}\n` +
                `你的说话风格：${personalityData.personality.speaking_style}\n` +
                `你在犯罪中的角色：${personalityData.personality.role_in_crime}\n\n` +
                `案件事实（这是你知道的真相，但你会根据你的性格在审讯中隐瞒或撒谎）：\n` +
                `时间: ${this.crimeMemory.time}\n` +
                `地点: ${this.crimeMemory.location}\n` +
                `方法: ${this.crimeMemory.method}\n` +
                `偷窃物品: ${this.crimeMemory.stolen}\n` +
                `逃跑方式: ${this.crimeMemory.escape}\n` +
                `伪造的不在场证明: ${this.crimeMemory.alibi}\n` +
                `同伙情况: ${this.crimeMemory.accomplice}\n\n` +
                `当被施压时，你的反应是：${personalityData.interrogation_responses.when_pressured}\n` +
                `当被问及同伙时，你的反应是：${personalityData.interrogation_responses.when_asked_about_accomplice}\n` +
                `当面对证据时，你的反应是：${personalityData.interrogation_responses.when_presented_evidence}\n` +
                `当被问及不在场证明时，你的反应是：${personalityData.interrogation_responses.when_asked_about_alibi}`
            }
        ];

        // 添加之前的对话历史
        if (interrogationHistory && interrogationHistory.length > 0) {
            messages.push(...interrogationHistory);
        }

        // 添加当前问题
        messages.push({
            role: 'user',
            content: question
        });

        // 发送请求并获取回答
        const answer = await this.sendMessage(messages);
        return answer;
    }

    /**
     * 分析两个嫌疑人的供词差异
     * @param {String} suspect1Text - 嫌疑人1的供词文本
     * @param {String} suspect2Text - 嫌疑人2的供词文本
     * @returns {Promise} - 返回分析结果
     */
    async analyzeContradictions(suspect1Text, suspect2Text) {
        // 确保数据已加载
        if (!this.suspect1Personality || !this.suspect2Personality) {
            await this.loadPersonalityData();
        }
        
        const messages = [
            {
                role: 'system',
                content: '你是一位经验丰富的警探，擅长分析嫌疑人供词中的矛盾和差异。请简短扼要地分析以下两位嫌疑人的供词，找出关键矛盾点和可能的谎言。回答要简洁明了，不超过100字。'
            },
            {
                role: 'user',
                content: `嫌疑人${this.suspect1Personality.name}的供词:\n${suspect1Text}\n\n嫌疑人${this.suspect2Personality.name}的供词:\n${suspect2Text}\n\n请简短扼要地分析这两份供词中的关键矛盾点，并指出哪些细节可能是谎言。`
            }
        ];

        const analysis = await this.sendMessage(messages);
        return analysis;
    }
}

// 创建API实例
const zhipuAPI = new ZhipuAPI();