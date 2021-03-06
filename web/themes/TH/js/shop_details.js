function getCity(country, obj) {
    $.getJSON("/country/get-city", {'country':country, 'province': $(obj).val()}, function (data) {
        $("#city_select option").remove();
        $("#postCode").val("");
        $("#city_select").append("<option value=''>กรุณาระบุเมือง / เขตเทศบาลของคุณ</option>");
        $.each(data, function(e,v){
            $("#city_select").append("<option value='" + v.post_code + "'>" + v.city + "</option>");
        });
    })
}
function setPostCode(obj) {
    $("#city_val").val($("#city_select option").not(function(){ return !this.selected }).text());
    $("#postCode").val($(obj).val());
}

function toThousands(num) {
    return num;
    // var result = [ ], counter = 0;
    // num = (num || 0).toString().split('');
    // for (var i = num.length - 1; i >= 0; i--) {
    //     counter++;
    //     result.unshift(num[i]);
    //     if (!(counter % 3) && i != 0) { result.unshift('.'); }
    // }
    // return result.join('');
}

$(function (){
    $(document).on("pageInit", function(e, pageId, $page) {
        console.log(pageId);
        switch(pageId){
            case 'home':
                fbq('track', 'PageView');
                break;
            case 'cart':
                console.log(pageId);
                fbq('track', 'AddToCart');
        }

    });
    var $content = $('.content');
    var $detailsForm = $('.details-form');
    var $inputs = $('#inputBox').find('input');
    var $detailsPriceBox = $('.xd-price-bg');
    var detailsPriceText = '';
    var detailsPriceLabel = '';
    var detailsiPriceTime = '';
    var sizeBoxHtml = '';
    var productInfo = '';
    var groupContr = false;   // 是否为组合
    var groupId = 0;//组ID
    var isGroup = 0;//是否组合
    var propertyInfo = {};//组合产品信息
    var $detailsSecondPriceBtn = $('.details-second-price-btn');
    var $detailsSecondPrice = $('.details-second-price');
    var nextPrice = 0;//第二件价格
    var nextPriceContr = true;
    var $numberBox = $('.number-box');
    var sizeArr = [];
    var colorArr = [];
    $.ajax({
        type: 'get',
        url: '/shop/api/' + requestId,
        dataType: 'json',
        success: function (res){
            productInfo = res;
            isGroup = res.product.is_group;
            nextPrice = Number(res.product.next_price);
            var _product = res.product;
            var _images = _product.images;
            // 差价
            var _colorSupplement = res.colorSupplement; 
            var colorText = '';
            console.log(_images);
            $('.details .title').text(_product.title);
            // banner
            for (var i = 0; i < _images.length; i++){
                var $swiperSlide = '<div class="swiper-slide"><img src="' + _images[i] + '"></div>';
                $('#swiperWrapper').append($swiperSlide);
            }
            $('.swiper-container').swiper({
                autoplay: 2000,
                autoplayDisableOnInteraction : false
            });
            $('#swiperWrapper img').error(function (){
                $(this).attr('src', '/themes/TH/images/details_banner1.jpg')
            });
            detailsPriceText = '<div class="details-price">\
                        <div class="row no-gutter">\
                            <div id="nowPrice" class="col-40">' + currency + _product.sale_price + '</div>\
                            <div class="col-60">\
                                <div class="row padding-style">\
                                    <div class="col-33"><em>ราคาเดิม</em><br><i class="i">' + currency + _product.price +'</i></div>\
                                    <div class="col-33"><em>ส่วนลด</em><br><i>' + _product.discount + '</i></div>\
                                    <div class="col-33"><em>ประหยัด</em><br><i>' + currency + _product.save + '</i></div>\
                                </div>\
                            </div>\
                        </div>\
                    </div>';
            detailsPriceLabel = '<div class="details-price-label"><span>จำกัดเวลาซื้อ</span><span>จัดส่งฟรี</span><span>เก็บเงินปลายทาง</span><span>สามารถเปลี่ยน / คืนสินค้าได้ภายใน 7 วัน</span></div>';
            detailsiPriceTime = '<div class="details-price-time">\
                        <div class="text">' + res.orderCount + ' ลูกค้าสั่งซื้อเรียบร้อย</div>\
                        <div id="remainTime" class="jltimer">\
                            <span id="hour"></span>H\
                            <span id="min"></span>M\
                            <span id="sec"></span>S\
                        </div>\
                    </div>';
            $detailsPriceBox.append(detailsPriceText);
            $detailsPriceBox.append(detailsPriceLabel);
            $detailsPriceBox.append(detailsiPriceTime);
            $detailsPriceBox.append('<div class="details-price-foot"><a href="#cart" class="button">ช็อปปิ้งตอนนี้</a></div>');
            timedCount();
            var nowPriceNum = Number($('#nowPrice').text().replace(/[^0-9\.]/ig, ''));
            var $totalPrice = $('#totalPrice');
            var _SupplementNowNum = nowPriceNum;
            var groupPrice = 0;
            var $inputNum = $('input[name=number]');
            var valueNumer = 1;
            // 组合
            if(_product.is_group == 1){
                groupId = $('#group_box span.active').attr('data-group');

                $.each(_product.groups, function(e, v){
                    if(v.group_id == groupId)
                    {
                        groupPrice = v.group_price;
                        $totalPrice.text(currency + v.group_price);
                        var groupNumber = 0;
                        $.each(v.websites, function(we, wv){
                            var _size = wv.size;
                            if(_size.length>0)
                            {
                                var sizeHtml = '';
                                for (var i = 0; i < _size.length; i++){
                                    if (i == 0){
                                        var sizeSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id +'" class="active">' + _size[i] + '</span>';
                                        if(propertyInfo[groupNumber] == undefined)
                                        {
                                            propertyInfo[groupNumber] = {};

                                        }
                                        propertyInfo[groupNumber]['website_id'] = wv.website_id;
                                        propertyInfo[groupNumber]['size'] = _size[i];

                                    } else {
                                        var sizeSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id +'">' + _size[i] + '</span>';
                                    }
                                    // $('#sizeBox .operation-box').append(sizeSpans);
                                    sizeHtml += sizeSpans;
                                }
                                $("#group_options").append('<div class="main-box sizeBox">\n' + wv.title +
                                    '                                <div class="label">ขนาด (ขนาดต่างกันสำหรับสองคู่โน้ต)</div>\n' +
                                    '                                <div class="operation-box">' + sizeHtml + '</div>\n' +
                                    '                            </div>');

                            }else{
                                //$('.sizeBox').remove();
                            }

                            var _color = wv.color;
                            if(_color.length > 0){
                                var colorHtml = '';
                                for (var i = 0; i < _color.length; i++){
                                    if (i == 0){
                                        var colorSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id +'" class="active color-image"><img src="' + _color[i].image + '">' + _color[i].name + '</span>';
                                        if(propertyInfo[groupNumber] == undefined)
                                        {
                                            propertyInfo[groupNumber] = {};

                                        }
                                        propertyInfo[groupNumber]['website_id'] = wv.website_id;
                                        propertyInfo[groupNumber]['color'] = _color[i].name;
                                    } else {
                                        var colorSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id +'" class="color-image"><img src="' + _color[i].image + '">' + _color[i].name + '</span>';
                                    }
                                    colorHtml += colorSpans;
                                    // $('#colorBox .operation-box').append(colorSpans);
                                }
                                $("#group_options").append('<div class="main-box colorBox">\n' + wv.title +
                                    '                                <div class="label">สี</div>\n' +
                                    '                                <div class="operation-box">' + colorHtml + '</div>\n' +
                                    '                            </div>');

                            }else {
                                //$('.colorBox').remove();
                            }
                            groupNumber++;
                        });

                        $('.colorBox span').click(function(){
                            var group_num = $(this).attr('data-gnum');
                            if(propertyInfo[group_num] == undefined)
                            {
                                propertyInfo[group_num] = {};
                            }
                            propertyInfo[group_num]['website_id'] = $(this).attr('data-id');
                            propertyInfo[group_num]['color'] = $(this).text();
                        });
                        $('.sizeBox span').click(function(){
                            var group_num = $(this).attr('data-gnum');
                            if(propertyInfo[group_num] == undefined)
                            {
                                propertyInfo[group_num] = {};
                            }
                            propertyInfo[group_num]['website_id'] = $(this).attr('data-id');
                            propertyInfo[group_num]['size'] = $(this).text();
                        });

                        $.init();
                    }
                });

                $("#group_box span").click(function(){
                    groupId = $(this).attr('data-group');
                    $("#group_options").children().remove();
                    propertyInfo = {};
                    $.each(_product.groups, function(e, v){
                        if(v.group_id == groupId)
                        {
                            groupPrice = v.group_price;
                            $totalPrice.text(currency + valueNumer * v.group_price);
                            var groupNumber = 0;
                            $.each(v.websites, function(we, wv){
                                var _size = wv.size;
                                if(_size.length>0)
                                {
                                    var sizeHtml = '';
                                    for (var i = 0; i < _size.length; i++){
                                        if (i == 0){
                                            var sizeSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id +'" class="active">' + _size[i] + '</span>';
                                            if(propertyInfo[groupNumber] == undefined)
                                            {
                                                propertyInfo[groupNumber] = {};

                                            }
                                            propertyInfo[groupNumber]['website_id'] = wv.website_id;
                                            propertyInfo[groupNumber]['size'] = _size[i];
                                        } else {
                                            var sizeSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id +'">' + _size[i] + '</span>';
                                        }
                                        // $('#sizeBox .operation-box').append(sizeSpans);
                                        sizeHtml += sizeSpans;
                                    }
                                    $("#group_options").append('<div class="main-box sizeBox">\n' + wv.title +
                                        '                                <div class="label">ขนาด (ขนาดต่างกันสำหรับสองคู่โน้ต)</div>\n' +
                                        '                                <div class="operation-box">' + sizeHtml + '</div>\n' +
                                        '                            </div>');

                                }else{
                                    //$('.sizeBox').remove();
                                }

                                var _color = wv.color;
                                if(_color.length > 0){
                                    var colorHtml = '';
                                    for (var i = 0; i < _color.length; i++){
                                        if (i == 0){
                                            var colorSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id + '" class="active color-image"><img src="' + _color[i].image + '">' + _color[i].name + '</span>';
                                            if(propertyInfo[groupNumber] == undefined)
                                            {
                                                propertyInfo[groupNumber] = {};

                                            }
                                            propertyInfo[groupNumber]['website_id'] = wv.website_id;
                                            propertyInfo[groupNumber]['color'] = _color[i].name;
                                        } else {
                                            var colorSpans = '<span data-gnum="' + groupNumber + '" data-id="'+ wv.website_id +'" class="color-image"><img src="' + _color[i].image + '">' + _color[i].name + '</span>';
                                        }
                                        colorHtml += colorSpans;
                                        // $('#colorBox .operation-box').append(colorSpans);
                                    }
                                    $("#group_options").append('<div class="main-box colorBox">\n' + wv.title +
                                        '                                <div class="label">สี</div>\n' +
                                        '                                <div class="operation-box">' + colorHtml + '</div>\n' +
                                        '                            </div>');

                                }else {
                                    //$('.colorBox').remove();
                                }
                                groupNumber++;
                            });
                        }

                    });
                    var $mainBox = $detailsForm.find('.main-box');
                    $mainBox.each(function (){
                        var $spans = $(this).find('span');
                        $spans.click(function (){
                            $spans.removeClass('active');
                            $(this).addClass('active');
                        });
                    });
                    $('.colorBox span').click(function(){
                        var group_num = $(this).attr('data-gnum');
                        if(propertyInfo[group_num] == undefined)
                        {
                            propertyInfo[group_num] = {};
                        }
                        propertyInfo[group_num]['website_id'] = $(this).attr('data-id');
                        propertyInfo[group_num]['color'] = $(this).text();
                    });
                    $('.sizeBox span').click(function(){
                        var group_num = $(this).attr('data-gnum');
                        if(propertyInfo[group_num] == undefined)
                        {
                            propertyInfo[group_num] = {};
                        }
                        propertyInfo[group_num]['website_id'] = $(this).attr('data-id');
                        propertyInfo[group_num]['size'] = $(this).text();
                    });

                    $.init();
                });

            }else{
                var _size = res.sizeData;
                for (var i = 0; i < _size.length; i++){
                    if (i == 0){
                        var sizeSpans = '<span class="active">' + _size[i] + '</span>';
                    } else {
                        var sizeSpans = '<span>' + _size[i] + '</span>';
                    }
                    $('#sizeBox .operation-box').append(sizeSpans);
                    $('#secondSizeBox .operation-box').append(sizeSpans);
                }
                var _color = res.colorInfo;
                for (var i = 0; i < _color.length; i++){
                    if (i == 0){
                        var colorSpans = '<span class="active color-image"><img src="' + _color[i].image + '">' + _color[i].name + '</span>';
                    } else {
                        var colorSpans = '<span class="color-image"><img src="' + _color[i].image + '">' + _color[i].name + '</span>';
                    }
                    $('#colorBox .operation-box').append(colorSpans); 
                    $('#secondColorBox .operation-box').append(colorSpans);
                }
                colorText = $('#colorBox').find('span.active').text();
                _SupplementNowNum = nowPriceNum + _colorSupplement[colorText];
                $totalPrice.text(currency + _SupplementNowNum);
                if (nextPrice > 0){
                    $detailsSecondPriceBtn.text('NEXT ' + nextPrice);
                    $detailsSecondPriceBtn.show();
                    $numberBox.find('b, input').hide();
                }
                $detailsSecondPriceBtn.click(function (){
                    if (nextPriceContr){
                        nextPriceContr = false;
                        $detailsSecondPrice.show();
                        _SupplementNowNum = _SupplementNowNum + nextPrice;
                    } else {
                        nextPriceContr = true;
                        $detailsSecondPrice.hide();
                        _SupplementNowNum = _SupplementNowNum - nextPrice;
                    }
                    $totalPrice.text(currency + _SupplementNowNum);
                });
            }
            var $mainBox = $detailsForm.find('.main-box');
            $mainBox.each(function (){
                var _this = $(this);
                var $spans = _this.find('span');
                $spans.click(function (){
                    if (_product.is_group !== 1) {
                        if (_this.is('#colorBox')){
                            colorText = $(this).text();
                            if (!nextPriceContr) {
                                _SupplementNowNum = valueNumer * (nowPriceNum + _colorSupplement[colorText] + nextPrice);
                            } else {
                                _SupplementNowNum = valueNumer * (nowPriceNum + _colorSupplement[colorText]);
                            }
                            $totalPrice.text(currency + _SupplementNowNum);
                        }
                    }
                    $spans.removeClass('active');
                    $(this).addClass('active');
                });
            });
            // 增删减
            $('.details-form .main-box .number-box b:nth-of-type(1)').click(function (){
                valueNumer = $inputNum.val();
                valueNumer--;
                if (valueNumer <= 1){
                    valueNumer = 1;
                }
                $inputNum.val(valueNumer);
                if(nextPrice>0 && _product.is_group !== 1){
                    var ttp = _SupplementNowNum + (valueNumer-1) * nextPrice;
                    $totalPrice.text(currency + toThousands(ttp));
                }else{
                    if (_product.is_group == 1){
                        $totalPrice.text(currency + toThousands(valueNumer * groupPrice));
                    } else {
                        _SupplementNowNum = valueNumer * (nowPriceNum + _colorSupplement[colorText]);
                        $totalPrice.text(currency + toThousands(_SupplementNowNum));
                    }
                }
            });
            $('.details-form .main-box .number-box b:nth-of-type(2)').click(function (){
                valueNumer = $inputNum.val();
                valueNumer++;
                $inputNum.val(valueNumer);
                if(nextPrice>0 && _product.is_group !== 1){
                    var ttp = _SupplementNowNum + (valueNumer-1) * nextPrice;
                    $totalPrice.text(currency + toThousands(ttp));
                }else{
                    if (_product.is_group == 1){
                        $totalPrice.text(currency + toThousands(valueNumer * groupPrice));
                    } else {
                        _SupplementNowNum = valueNumer * (nowPriceNum + _colorSupplement[colorText]);
                        $totalPrice.text(currency + toThousands(_SupplementNowNum));
                    }
                }
            });
            $("#info").html(_product.info);
            $("#attr_info").html(_product.additional);
            $.init();
        }
    });
    // 计时器
    var this_time = Date.parse(new Date()) / 1000;
    var end_timestamp = end_timestamp_num * 3600 + this_time;
    var timedCount = function (){
        this_time = this_time + 1;
        var sub_all_sec = end_timestamp - this_time;
        var sub_day = parseInt(sub_all_sec / 86400);
        var sub_hour = parseInt((sub_all_sec % 86400) / 3600);
        var sub_min = parseInt((sub_all_sec % 3600) / 60);
        var sub_sec = parseInt(sub_all_sec % 60);
        if (sub_all_sec > 0){
             setTimeout(function (){
                timedCount();
            }, 1000);
        } else {
            sub_day = 0;
            sub_hour = 0;
            sub_min = 0;
            sub_sec = 0;
        }
        // if(sub_day < 10){
        //     sub_day = "0" + sub_day;
        // }
        if (sub_day > 0){
            sub_hour = sub_day * 24 + sub_hour;
        }
        if(sub_hour < 10){
            sub_hour = "0" + sub_hour;
        }
        if(sub_min < 10){
            sub_min = "0" + sub_min;
        }
        if(sub_sec < 10){
            sub_sec = "0" + sub_sec;
        }
        $("#day").html(sub_day);
        $("#hour").html(sub_hour);
        $("#min").html(sub_min);
        $("#sec").html(sub_sec);   
    }
    // shop Now
    var $mainBox = $detailsForm.find('.main-box');
    $('.details-price-foot .button, .details-nav .tab-item:first-child').live('click', function (){
        var shopNowTop = $detailsForm.offset().top;
        var contentScrollTop = $content.scrollTop();
        $content.scrollTop(shopNowTop + contentScrollTop);
    });
    $mainBox.each(function (){
        var $spans = $(this).find('span');
        $spans.click(function (){
            $spans.removeClass('active');
            $(this).addClass('active');
        });
    });
    // 跑马灯
    var $listBlockFirst = $('.list-li-marquee1');
    var $ul = $listBlockFirst.find('ul');
    var appendHtmlContr = true;
    if ($listBlockFirst.outerHeight() < $ul.outerHeight()){
        setLiMarquee($listBlockFirst);
    }
    function setLiMarquee(eleObj){
        var $liFirst = eleObj.find('li:first-child');
        var liFirstHeight = $liFirst.outerHeight();
        var ulTopNum = parseFloat($ul.css('top'));
        if (appendHtmlContr){
            appendHtmlContr = false;
            $ul.append('<li>' + $liFirst.html() + '</li>');
        }
        ulTopNum--;
        if (ulTopNum == -liFirstHeight){
            ulTopNum = 0;
            $liFirst.remove();
            appendHtmlContr = true;
        }
        $ul.css('top', ulTopNum);
        setTimeout(function (){
            setLiMarquee(eleObj);
        }, 30);
    }
    // footer-icon
    var popupTextArray = [
        {
            text: 'เกี่ยวกับเรา<br>พวกเราให้ความสำคัญในด้านการเลือกที่ผลิต งานฝีมือและวัตถุดิบของสินค้าอย่างเข้มงวด เช่น เครื่องแต่งกาย กระเป๋า เครื่องครัว เครื่องกีฬา เพื่อให้สินค้าที่มีคุณภาพดีที่สุดกับคุณ.<br><button type="button" class="button">Back</button>'
        },
        {
            text: 'การแจ้งเตือนผู้ใช้<br>การใช้ผลิตภัณฑ์นี้จะขึ้นอยู่กับแต่ละสถานการณ์ ไม่มีการรับประกันว่าผู้ใช้ทุกคนจะได้รับผลลัพธ์ที่โฆษณา หากมีข้อสงสัย กรุณาติดต่อฝ่ายบริการลูกค้าออนไลน์หรือติดต่อทาง e-mail (supportth@kingdomskymall.com)  บริษัทของเรามีสิทธิในการตีความ.<br><button type="button" class="button">Back</button>'
        },
        {
            text: 'รายละเอียดการจัดส่ง<br>ทางเราจะจัดส่งสินค้าภายใน 3 วันโดยตามลำดับหลังจากสั่งซื้อสินค้าสำเร็จ และจะต้องใช้ระยะเวลาอีก 10 วันสำหรับการขนส่ง<br><button type="button" class="button">Back</button>'
        },
        {
            text: 'วิธีการติดต่อ<br>บริการลูกค้าออนไลน์ตลอด 24 ชม：<br>อีเมล：<span>supportth@kingdomskymall.com</span><br />หากคุณมีคำถามใด ๆ  โปรดติดต่อหรือปรึกษาบริการลูกค้าออนไลน์ของเรา ขอบคุณมาก.<br><button type="button" class="button">Back</button>'
        },
        {
            text: 'กระบวนการส่งคืน<br>วิธีการเปลี่ยน/คืน:<br>    1.การเปลี่ยน/คืนสินค้าส่วนตัว: ภายใน 7 วันนับจากวันที่ได้รับสินค้า โปรดติดต่อฝ่ายบริการลูกค้าออนไลน์ของเราหรือส่งอีเมลไปที่ supportth@kingdomskymall.com,โดยไม่มีผลต่อยอดขายรอง ฝ่ายบริการลูกค้าจะตอบแทนภายใน 1-3 วันหลังจากได้รับข้อความ คุณต้องการชำระเงินของค่าขนส่ง.<br>กระบวนการส่งคืน:<br>   ได้รับสินค้า - ใบสมัครสำหรับการรับคืน - การตรวจสอบการบริการลูกค้า - ส่งคืนสินค้า - การตรวจสอบฝ่ายคลังสินค้า - การตรวจสอบผลตอบแทน - การคืนเงิน / การแลกเปลี่ยนสินค้า      กรุณาระบุ: เลขที่ใบสั่งซื้อ ชื่อ เบอร์โทรศัพท์.<br><button type="button" class="button">Back</button>'
        },
        {
            text: 'สอบถามเกี่ยวกับโลจิสติกส์<br><button type="button" class="button">Back</button>'
        }
    ];
    var $popupFooterText = $('.popup-footer-text');
    $('.details-footer img').each(function (index){
        $(this).click(function (){
            $popupFooterText.find('p').html(popupTextArray[index].text);
            $.popup('.popup-footer-text');
        });
    });
    $popupFooterText.click(function (){
        $.closeModal('.popup-footer-text');
    });
    // 提交
    $detailsForm.submit(function (){
        for (var i = 0; i < $inputs.length; i++){
            var _input = $inputs.eq(i);
            if (_input.val() == '' && _input.attr('name')!='email'){
                _input.focus();
                return false;
            }
        }
        if (groupContr){
            var $sizeActive = $('.sizeBox span.active');
            var $colorActive = $('.colorBox span.active');
            for (var j = 0; j < $sizeActive.length; j++){
                sizeArr.push($('.sizeBox span.active').eq(j).text());
            }
            for (var k = 0; k < $colorActive.length; k++){
                colorArr.push($('.colorBox span.active').eq(k).text());
            }
        } else {
            sizeArr.push($('#sizeBox span.active').text());
            colorArr.push($('#colorBox span.active').text());
            if (!nextPriceContr){
                sizeArr.push($('#secondSizeBox span.active').text());
                colorArr.push($('#secondColorBox span.active').text());
            }
        }
        var num = $('input[name=number]').val();
        var name = $('input[name=inputName]').val();
        var mobile = $('input[name=mobile]').val();
        var email = $('input[name=email]').val();
        var province = $('#province').val();
        var city = $('input[name="city"]').val();
        var address = $('input[name=address]').val();
        var postCode = $('input[name=postCode]').val();
        var comment = $('textarea[name=comment]').val();
        var totalPriceNum = $('#totalPrice').text().replace(/[^0-9\.]/ig, '');
        $.ajax({
            type: 'post',
            url: '/shop/add/order',
            data: {
                host: requestId,
                is_group: isGroup,
                group_id: groupId,
                color: colorArr,
                size: sizeArr,
                num: num,
                name: name,
                mobile: mobile,
                email: email,
                province: province,
                city: city,
                address: address,
                post_code: postCode,
                comment: comment,
                total_price: totalPriceNum,
                propertyInfo: JSON.stringify(propertyInfo)
            },
            dataType: 'json',
            success: function (res){
                fbq('track', 'Purchase');
                $("#order_id").html('JTNX' + res.orderId);
                $("#order_price").html(res.total);
                $.popup('.popup-success');
            }
        });   
    });
    // $.init();
});