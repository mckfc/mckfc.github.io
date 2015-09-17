var testData = {
    indexData: {//头部指标数据
        name: "沪深300",
        price: 3921.11,
        priceChange: -59.67,
        priceChangePercents: -0.0159
    },
    betCount: {
        left: 1,//投左边的人数
        right: 8//投右边的人数
    },
    betStatus: {//用户当前投注状态
        betted: false,//已投注？
        betLeft: false,//投左边？
        betAmount: 0//投注金额
    },
    eventOpening: true,//活动是否进行中
    minAmount: 1,//最小投注金额
    maxAmount: 300077//余额
};

//临时投注状态变量... 完整JS架构不知道，所以不知道放哪合适
var newBetStatus = {
    betLeft: false
};

var productApp = new Framework7({
    material: Framework7.prototype.device.android 
});
var $$ = Dom7;

//初始化页面
(function () {

    //初始化头部指数信息
    $$('#index-name').text(testData.indexData.name);
    $$('#index-price-value').text(testData.indexData.price);
    if (testData.indexData.priceChange > 0) {
        $$('#index-price').parent().addClass('price-up');
    } else {
        $$('#index-price').parent().addClass('price-down');
    }
    $$('#index-price-change').text(testData.indexData.priceChange);
    $$('#index-price-change-percents').text(testData.indexData.priceChangePercents * 100 + '%');

    //初始化比例图
    var windowWidth = $$(window).width();
    var chart = $$('#percentage-chart');
    chart.attr('width', windowWidth).attr('viewport', '0 0 ' + windowWidth + ' 30');
    var downChartPoints = ["0,25",
        "45, 25",
        "65, 5",
        (windowWidth - 65) + ",5",
        (windowWidth - 45) + ",25",
        windowWidth + ",25 "];
    $$('#down-percentage').attr('points', downChartPoints.join(' '));
    var leftRate = testData.betCount.left / (testData.betCount.left + testData.betCount.right);
    showBetChart(testData.betCount);


    //初始化下注状态
    showBetStatus(testData.betStatus, testData.eventOpening);

    //允许动态生成下注页面
    window.mainView = productApp.addView('.view-main', { dynamicNavbar: !productApp.device.android });

    //加载投注页面时隐藏底部栏
    productApp.onPageBeforeInit('bet', function (page) {
        $$('#product-timing').hide();
    });

    //离开投注页面时恢复底部栏
    productApp.onPageBack('bet', function (page) {
        $$('#product-timing').show();
        showBetChart(testData.betCount);
    });

    //加载bet页面后初始化bet页面
    productApp.onPageAfterAnimation('bet', function (page) {

        initBetOptionAnimation(newBetStatus.betLeft);

        $$('#bet-amount-value').on('keyup change', function () {
            var amountValue = $$(this).val();
            var reg = /^\d+$/;
            var isValidEntry = false;

            if (reg.test(amountValue)) {
                var amount = parseFloat(amountValue);
                isValidEntry = amount >= testData.minAmount && amount <= testData.maxAmount;
            }

            var submitButton = $$('#submit-button');
            if (isValidEntry) {
                if (submitButton.hasClass('disabled')) {
                    submitButton.removeClass('disabled');
                }
            } else {
                if (!submitButton.hasClass('disabled')) {
                    submitButton.addClass('disabled');
                }
            }
        });

        $$('#the-balance').text(testData.maxAmount.toLocaleString());
        $$('#bet-amount-value').attr('placeholder', "最低下注额度 " + testData.minAmount.toLocaleString() + "元");

        $$('#submit-button').on('click', function () {
            //save bet status
            var amountValue = $$('#bet-amount-value').val();
            testData.betStatus.betted = true;
            testData.betStatus.betAmount = parseFloat(amountValue);
            if (testData.betStatus.betLeft) {
                testData.betCount.left++;
            }else{
                testData.betCount.right++;
            }

            //AJAX相关代码加载这里
            //ajax callback:
            //display msg
            var roseButton = $$('#bet-rose-selection');
            if (roseButton.attr('data-selected') == 'yes') {
                $$('#bet-fall-selection').hide();
                roseButton.addClass('betted-selection');
            } else {
                roseButton.hide();
                $$('#bet-fall-selection').addClass('betted-selection');
            }

            $$('#to-bet-section').hide();
            $$('#delegate-success').show();

        });

        $$('#confirm-button').on('click', function () {
            window.mainView.router.back();
        });

    });

    //返回product页面后更新下注状态
    productApp.onPageBack('bet', function (page) {
        
        showBetStatus(testData.betStatus, testData.eventOpening);

    });

    $$('#bet-rose-status').on('click', function (e) {
        newBetStatus.betLeft = true;
    });

    $$('#bet-fall-status').on('click', function (e) {
        newBetStatus.betLeft = false;
    });
})();





function showBetChart(betCount) {

    var percent = betCount.left / (betCount.left + betCount.right);

    var leftPercent = parseInt(100 * percent);
    var rightPercent = 100 - leftPercent;
    $$('#rose-percent').text(leftPercent + '%');
    $$('#fall-percent').text(rightPercent + '%');


    var windowWidth = $$(window).width();
    var upChartPoints = ["0,25"];

    var upPercentWidth = windowWidth * percent;
    if (upPercentWidth < 45) {
        upChartPoints.push(upPercentWidth + ",25");
    } else if (upPercentWidth < 65) {
        upChartPoints.push("45, 25");
        upChartPoints.push(upPercentWidth + "," + (70 - upPercentWidth));

    } else if (upPercentWidth < windowWidth - 65) {
        upChartPoints.push("45, 25");
        upChartPoints.push("65, 5");
        upChartPoints.push(upPercentWidth + ", 5");

    } else if (upPercentWidth < windowWidth - 45) {
        upChartPoints.push("45, 25");
        upChartPoints.push("65, 5");
        upChartPoints.push(windowWidth - 65 + ", 5");
        upChartPoints.push(upPercentWidth + "," + (70 - windowWidth + upPercentWidth));
    } else {
        upChartPoints.push("45, 25");
        upChartPoints.push("65, 5");
        upChartPoints.push(windowWidth - 65 + ", 5");
        upChartPoints.push(windowWidth - 45 + ", 25");
        upChartPoints.push(upPercentWidth + ", 25");
    }

    $$('#up-percentage').attr('points', upChartPoints.join(' '));
}

function showBetStatus(betStatus, eventOpening) {
    if (betStatus.betted) {
        if (eventOpening) {
            $$('#betted-section').show();
        }
        var targetItem = $$(betStatus.betLeft ? '#bet-rose-status' : '#bet-fall-status');
        $$('#betted-txt').remove();
        $$('#betted-amount').remove();
        targetItem.prepend('<div id="betted-txt">已下注</div>').append('<div id="betted-amount">' + betStatus.betAmount.toLocaleString() + '</div>');
    }

    if (!eventOpening) {
        $$('#bet-rose-status').addClass('disabled');
        $$('#bet-fall-status').addClass('disabled');
        $$('#bet-end-section').show();
    }
}

function initBetOptionAnimation(betLeft) {
    var roseButton = $$('#bet-rose-selection').on('click', function (e) {
        var roseButton = $$(this);
        var fallButton = $$('#bet-fall-selection');
        var prevStatus = roseButton.attr('data-selected');

        if (prevStatus == "yes") {
            return;
        }
        if (navigator.userAgent.indexOf("Safari") > -1) {//to fix font-size animation issue in safari: http://stackoverflow.com/questions/29552139/website-repeatedly-reloads-then-crashes-on-iphone-4-ios-8-0-2-ios-8-1-2
            roseButton.css('font-size', '1.8em');
            fallButton.css('font-size', '1.2em');
        }


        roseButton.attr('class', 'bet-status-icon');
        fallButton.attr('class', 'bet-status-icon');

        if (!prevStatus) {
            roseButton.addClass('left-normal-selected');
            fallButton.addClass('right-normal-unselected');
        } else if (prevStatus == "no") {
            roseButton.addClass('left-unselected-selected');
            fallButton.addClass('right-selected-unselected');
        }

        roseButton.attr('data-selected', 'yes');
        fallButton.attr('data-selected', 'no');
        testData.betStatus.betLeft = true;
    });

    var fallButton = $$('#bet-fall-selection').on('click', function (e) {
        var fallButton = $$(this);
        var roseButton = $$('#bet-rose-selection');

        var previewStatus = fallButton.attr('data-selected');

        if (previewStatus == "yes") {
            return;
        }

        if (navigator.userAgent.indexOf("Safari") > -1) {//to fix font-size animation issue in safari: http://stackoverflow.com/questions/29552139/website-repeatedly-reloads-then-crashes-on-iphone-4-ios-8-0-2-ios-8-1-2
            fallButton.css('font-size', '1.8em');
            roseButton.css('font-size', '1.2em');
        }


        roseButton.attr('class', 'bet-status-icon');
        fallButton.attr('class', 'bet-status-icon');

        if (!previewStatus) {
            fallButton.addClass('right-normal-selected');
            roseButton.addClass('left-normal-unselected');
        } else if (previewStatus == "no") {
            fallButton.addClass('right-unselected-selected');
            roseButton.addClass('left-selected-unselected');
        }

        fallButton.attr('data-selected', 'yes');
        roseButton.attr('data-selected', 'no');
        testData.betStatus.betLeft = false;
    });

    if (betLeft) {
        roseButton.click();
    } else {
        fallButton.click();
    }
}