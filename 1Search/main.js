// By JunM。
// Please refer to Readme.md

let utils = require("scripts/utils");

let deviceScreenHeight = $device.info["screen"]["height"];
let deviceScreenWidth = $device.info["screen"]["width"];

let search_content = "Test";

let search_engines = [
    {
        "search_engine_name": $l10n("Google"),
        "search_engine_url": "https://www.google.com/search?q=%s"
    },
    {
        "search_engine_name": $l10n("Sougou"),
        "search_engine_url": "https://www.sogou.com/web?query=%s"
    },
    {
        "search_engine_name": $l10n("Zhihu"),
        "search_engine_url": "https://www.zhihu.com/search?type=content&q=%s"
    },
    {
        "search_engine_name": $l10n("sspai"),
        "search_engine_url": "https://sspai.com/search/article?q=%s"
    },
    {
        "search_engine_name": $l10n("Google Images"),
        "search_engine_url": "https://www.google.com/search?&tbm=isch&q=%s"
    },
    {
        "search_engine_name": $l10n("YouTube"),
        "search_engine_url": "https://m.youtube.com/results?q=%s"
    },
    {
        "search_engine_name": $l10n("Bing Dict"),
        "search_engine_url": "https://cn.bing.com/dict/search?q=Test"
    },
    {
        "search_engine_name": $l10n("Taobao"),
        "search_engine_url": "https://s.m.taobao.com/h5?&q=%s"
    },
    {
        "search_engine_name": $l10n("Jingdong"),
        "search_engine_url": "https://so.m.jd.com/ware/search.action?keyword=%s"
    },
    {
        "search_engine_name": $l10n("IP Search"),
        "search_engine_url": "http://www.ip138.com/ips138.asp?ip=%s"
    },
];


const mainView = {
    props: {
        title: "1Search",
    },
    views: [
        {
            type: "menu",
            props: {
                id: "search_engine_selection_menu",
                items: search_engines.map(search_engine_item => search_engine_item.search_engine_name),
                index: 0
            },
            layout: function (make) {
                // make.top.equalTo(50);
                make.left.top.right.equalTo(0);
                make.height.equalTo(44)
            },
            events: {
                changed: function (sender) {
                    $("search_result_web_view").url = search_engines[$("search_engine_selection_menu").index]
                        ["search_engine_url"].replace(/%s/, $text.URLEncode(search_content));
                }
            }
        },
        {
            type: "web",
            props: {
                id: "search_result_web_view",
                url: search_engines[0]["search_engine_url"].replace(/%s/, $text.URLEncode(search_content)),
                script: function () {
                }
            },
            layout: function (make) {
                make.top.equalTo(44);
                make.left.right.equalTo(0);
                make.bottom.inset(0);
            },
        }
    ]
};

// $ui.render(mainView);

if (($app.env !== $env.app) && ($app.env !== $env.action)) {
    let jump_url = "jsbox://run?name=" + $text.URLEncode($addin.current.name);
    $ui.alert({
        title: $l10n("Please run in JSBox APP"),
        actions: [
            {
                title: "Jump to JSBox APP",
                handler: function () {
                    $app.openURL(jump_url);
                }
            },
            {
                title: "Exit",
                handler: function () {
                    utils.stopScript();
                }
            }
        ]
    })

} else if ($app.env === $env.action) {
    if ($context.text !== "") {
        search_content = $context.text;
        $ui.render(mainView);
        $("search_result_web_view").url = search_engines[0]["search_engine_url"].replace(/%s/, $text.URLEncode(search_content));
    }
} else if ($app.env === $env.app) {

    $ui.menu({
        items: [$l10n("Search clipboard"), $l10n("Input now")],
        handler: function (title, idx) {
            if (idx === 0) {
                search_content = $clipboard.text;
                $ui.render(mainView);
                $("search_result_web_view").url = search_engines[0]["search_engine_url"].replace(/%s/, $text.URLEncode(search_content));
            } else if (idx === 1) {
                $input.text({
                    placeholder: $l10n("Please input search content"),
                    handler: function (text) {
                        // $ui.toast(text);
                        search_content = text;
                        $ui.render(mainView);
                        $("search_result_web_view").url = search_engines[0]["search_engine_url"].replace(/%s/, $text.URLEncode(search_content));
                    }
                })

            }
        },
        // finished: function (cancelled) {
        //     utils.stopScript();
        // }
    });
}



