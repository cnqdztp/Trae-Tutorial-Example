/**
 * 游戏主入口文件
 */

// 等待DOM加载完成
document.addEventListener('DOMContentLoaded', function() {
    // 创建Phaser游戏配置
    const gameConfig = {
        type: Phaser.AUTO,
        width: config.width,
        height: config.height,
        backgroundColor: config.backgroundColor,
        parent: 'game-container',
        scene: [],
        physics: {
            default: 'arcade',
            arcade: {
                gravity: { y: 0 },
                debug: false
            }
        }
    };

    // 创建游戏实例
    const game = new Phaser.Game(gameConfig);

    // 隐藏加载提示
    const loadingElement = document.getElementById('loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }

    // 添加场景
    game.scene.add('BootScene', BootScene, true); // 自动启动引导场景
    game.scene.add('MainMenuScene', MainMenuScene, false);
    game.scene.add('InterrogationScene', InterrogationScene, false);
    game.scene.add('ComparisonScene', ComparisonScene, false);
    game.scene.add('ResultScene', ResultScene, false);

    // 全局游戏状态
    game.gameState = {
        suspect1Interrogation: [],  // 嫌疑人1的审讯记录
        suspect2Interrogation: [],  // 嫌疑人2的审讯记录
        currentSuspect: null,       // 当前审讯的嫌疑人
        contradictions: [],         // 发现的矛盾点
        gameProgress: 0             // 游戏进度
    };

    // 全局访问API
    game.zhipuAPI = zhipuAPI;

    // 监听窗口大小变化，调整游戏尺寸
    window.addEventListener('resize', function() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const aspectRatio = config.width / config.height;

        let newWidth, newHeight;

        if (width / height > aspectRatio) {
            newHeight = Math.min(height, config.height);
            newWidth = newHeight * aspectRatio;
        } else {
            newWidth = Math.min(width, config.width);
            newHeight = newWidth / aspectRatio;
        }

        game.scale.resize(newWidth, newHeight);
        game.scale.refresh();
    });

    // 初始调整大小
    window.dispatchEvent(new Event('resize'));
});