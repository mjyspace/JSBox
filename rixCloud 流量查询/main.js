// By JunM
// 2018-05-20
// $cache.clear();

$app.validEnv = $env.today | $env.app;
if ($app.env !== $env.today && $app.env !== $env.app && $app.env !== $env.notification) {
    $ui.toast("aaaa");
    $ui.alert("请在 Widget 和 APP 内运行");
    $app.close();
}


let canvas_height = 800;
let canvas_width = 860;
if ($app.env === $env.today) {
    canvas_height = 460;
    canvas_width = 1700;
}

let rixcloud_user_name = null;
let rixcloud_account_password = null;
let rixcloud_service_id = null;
let rixcloud_service_name = null;
let everyday_trigger_boolean = null;
let everyday_trigger_time = null;
let everyday_trigger_content = "按压（3D Touch）本通知显示流量统计，点击将会跳转到 APP 内运行";
let html_template = $file.read("/assets/html/template.html").string;
let user_data = $cache.get("user_data");

let color_of_download = "#d78965";
let color_of_upload = "#F6C555";
let color_of_available = "#7BA23F";


function cancel_trigger() {
    $push.cancel({
        title: $addin.current.displayName,
        body: everyday_trigger_content,
    });
}

function activate_trigger() {
    $push.schedule({
        title: $addin.current.displayName,
        body: everyday_trigger_content,
        date: everyday_trigger_time,
        script: $addin.current.displayName,
        // height: 300,
        repeats: true,
        handler: function (result) {
            let id = result.id;
        }
    });
}


function trigger_persistent() {
    if (everyday_trigger_boolean === true && $app.env !== $env.notification) {

        cancel_trigger();

        $delay(1, function () {
            activate_trigger();
        });

    }
}

function loading_view() {
    $ui.render(
        {
            props: {
                title: "查询中",
            },
            views: [
                {
                    type: "spinner",
                    props: {
                        loading: true,
                    },
                    layout: function (make, view) {
                        make.center.equalTo(view.super);
                    }
                },
            ]
        }
    )
}


function error_handler(status_code) {
    if (status_code === 401) {
        $ui.alert({
            title: "鉴权失败",
            message: `您输入的用户名为：\n${rixcloud_user_name}\n您输入的密码为：\n${rixcloud_account_password}\n\n
            如果有误，点击确定并重新输入；\n\n如果无误，请确认您的账号可以正常访问；\n\n
            此外，已发现有的密码会影响访问 rixCloud  API，可以尝试临时修改登陆密码为简单密码，看看是否可以正常运行。`.trim(),
        });
        $cache.clear();
        $app.close(1);
    } else {
        $ui.alert({
            title: "获取信息失败",
            message: "错误码为：\n" + status_code,
        })
    }
    $app.close(2);
}


function get_service_data() {
    $http.request({
        method: "GET",
        url: `https://api.rixcloud.io/v1/profile/service/${rixcloud_service_id}/traffic`,
        header: {
            "Authorization": "Basic " + $text.base64Encode(rixcloud_user_name + ":" + rixcloud_account_password)
        },
        body: {},
        handler: function (resp) {
            console.log("resp.response.statusCode");
            if (resp.response.statusCode !== 200) {
                error_handler(resp.response.statusCode);
            }
            let data = resp.data;
            let upload_usage_gb = data["data"]["upload"] / (1024 * 1024 * 1024);
            console.log("upload_usage_gb: " + upload_usage_gb);
            let download_usage_gb = data["data"]["download"] / (1024 * 1024 * 1024);
            let total_usage_gb = upload_usage_gb + download_usage_gb;
            let total_quota_gb = data["data"]["total"] / (1024 * 1024 * 1024);


            let chartData = `[
            [${download_usage_gb}, "${color_of_download}", "${"已下载 " + download_usage_gb.toFixed(2) + " GB"}"],
            [${upload_usage_gb}, "${color_of_upload}", "${"已上传 " + upload_usage_gb.toFixed(2) + " GB"}"],
            [${total_quota_gb - total_usage_gb}, "${color_of_available}", "${"可用 " + (total_quota_gb
                - total_usage_gb).toFixed(2) + " GB"}"]
        ]`;

            html_template = html_template.replace(/\$\$\$chartData\$\$\$/, chartData);
            html_template = html_template.replace(/\$\$\$canvas_height\$\$\$/, canvas_height);
            html_template = html_template.replace(/\$\$\$canvas_width\$\$\$/, canvas_width);

            console.log(html_template);

            $ui.render(
                {
                    props: {
                        title: "流量查询",
                    },
                    views: [
                        {
                            type: "web",
                            props: {
                                id: "web_view_test",
                                html: html_template
                            },
                            layout: $layout.fill,
                            events: {}
                        },
                    ]
                }
            );
            if ($app.env === $env.app) {
                $app.close(10);
            }
        }
    });
}


function get_user_data() {
    if (user_data === undefined) {

        $input.text({
            placeholder: `请输入 rixCloud 用户名`,
            handler: function (text) {
                rixcloud_user_name = text;
                $input.text({
                    placeholder: `请输入 rixCloud 登陆密码`,
                    handler: function (text) {
                        rixcloud_account_password = text;
                        $http.request({
                            method: "GET",
                            url: `https://api.rixcloud.io/v1/profile/service`,
                            header: {
                                "Authorization": `Basic `
                                + $text.base64Encode(`${rixcloud_user_name}:${rixcloud_account_password}`)
                            },
                            body: {},
                            handler: function (resp) {
                                console.log(resp.response.statusCode);

                                if (resp.response.statusCode !== 200) {
                                    error_handler(resp.response.statusCode);
                                } else {
                                    let data = resp.data;
                                    let active_service_list = data["data"]["actived"];
                                    $ui.menu({
                                        items: active_service_list.map(i => (i["serviceid"] + "  " + i["name"])),
                                        handler: function (title, idx) {
                                            rixcloud_service_id = active_service_list[idx]["serviceid"];
                                            rixcloud_service_name = active_service_list[idx]["name"];
                                            $ui.menu({
                                                items: ["设置每日提醒", "不设置提醒"],
                                                handler: function (title, idx) {
                                                    if (idx === 0) {
                                                        everyday_trigger_boolean = true;
                                                        $ui.render(
                                                            {
                                                                props: {
                                                                    title: "请选择每日提醒的时间",
                                                                },
                                                                views: [
                                                                    {
                                                                        type: "date-picker",
                                                                        layout: function (make, view) {
                                                                            make.center.equalTo(view.super);
                                                                            make.height.equalTo(300);
                                                                        },

                                                                        events: {
                                                                            changed: function (sender) {
                                                                                everyday_trigger_time = sender.date;
                                                                            }
                                                                        },
                                                                    },
                                                                    {
                                                                        type: "button",
                                                                        props: {
                                                                            type: $btnType.custom,
                                                                            bgcolor: $color("#a362f7"),
                                                                            icon: $icon("064", $color("#222222"),
                                                                                $size(23, 23)),

                                                                            title: "  Next    ",
                                                                            font: $font("default", 26),
                                                                        },
                                                                        layout: function (make, view) {
                                                                            make.top.equalTo($device.info["screen"]["height"] * 0.7);
                                                                            make.height.equalTo(50);
                                                                            make.width.equalTo(200);
                                                                            make.centerX.equalTo($device.info["screen"]["width"] * 0.7 * 0.05);
                                                                        },
                                                                        events: {
                                                                            tapped: function (sender) {
                                                                                $device.taptic(1);
                                                                                $ui.alert({
                                                                                    title: "提示",
                                                                                    message: "在通知上按压（3D Touch）" +
                                                                                    "即可查看流量使用情况\n\n" +
                                                                                    "由于 JSBox 本身的原因，" +
                                                                                    "设置好的提醒可能" +
                                                                                    "被其他脚本冲掉。\n\n" +
                                                                                    "如果发生这种情况，" +
                                                                                    "运行一次本脚本即可" +
                                                                                    "恢复通知\n\n",
                                                                                });

                                                                                $cache.set("user_data", {
                                                                                    "rixcloud_user_name": rixcloud_user_name,
                                                                                    "rixcloud_account_password": rixcloud_account_password,
                                                                                    "rixcloud_service_id": rixcloud_service_id,
                                                                                    "rixcloud_service_name": rixcloud_service_name,
                                                                                    "everyday_trigger_boolean": everyday_trigger_boolean,
                                                                                    "everyday_trigger_time": everyday_trigger_time
                                                                                });
                                                                                trigger_persistent();
                                                                                get_service_data();


                                                                            }
                                                                        }
                                                                    }
                                                                ]
                                                            }
                                                        )
                                                    } else if (idx === 1) {
                                                        cancel_trigger();
                                                        everyday_trigger_boolean = false;
                                                        everyday_trigger_time = null;
                                                        $cache.set("user_data", {
                                                            "rixcloud_user_name": rixcloud_user_name,
                                                            "rixcloud_account_password": rixcloud_account_password,
                                                            "rixcloud_service_id": rixcloud_service_id,
                                                            "rixcloud_service_name": rixcloud_service_name,
                                                            "everyday_trigger_boolean": everyday_trigger_boolean,
                                                            "everyday_trigger_time": everyday_trigger_time
                                                        });
                                                        trigger_persistent();
                                                        get_service_data();
                                                    }
                                                }
                                            });
                                        }
                                    });
                                }
                            }
                        });
                    }
                });
            }

        });

    } else if (user_data.everyday_trigger_boolean === null || user_data.everyday_trigger_boolean === undefined) {
        rixcloud_user_name = user_data.rixcloud_user_name;
        rixcloud_account_password = user_data.rixcloud_account_password;
        rixcloud_service_id = user_data.rixcloud_service_id;
        rixcloud_service_name = user_data.rixcloud_service_name;

        $ui.menu({
            items: ["设置每日提醒", "不设置提醒"],
            handler: function (title, idx) {
                if (idx === 0) {
                    everyday_trigger_boolean = true;
                    $ui.render(
                        {
                            props: {
                                title: "请选择每日提醒的时间",
                            },
                            views: [
                                {
                                    type: "date-picker",
                                    layout: function (make, view) {
                                        make.center.equalTo(view.super);
                                        make.height.equalTo(300);
                                    },

                                    events: {
                                        changed: function (sender) {
                                            everyday_trigger_time = sender.date;
                                        }
                                    },
                                },
                                {
                                    type: "button",
                                    props: {
                                        type: $btnType.custom,
                                        bgcolor: $color("#a362f7"),
                                        icon: $icon("064", $color("#222222"),
                                            $size(23, 23)),

                                        title: "  Next    ",
                                        font: $font("default", 26),
                                    },
                                    layout: function (make, view) {
                                        make.top.equalTo($device.info["screen"]["height"] * 0.7);
                                        make.height.equalTo(50);
                                        make.width.equalTo(200);
                                        make.centerX.equalTo($device.info["screen"]["width"] * 0.7 * 0.05);
                                    },
                                    events: {
                                        tapped: function (sender) {
                                            $device.taptic(1);
                                            $ui.alert({
                                                title: "提示",
                                                message: "在通知上按压（3D Touch）" +
                                                "即可查看流量使用情况\n\n" +
                                                "由于 JSBox 本身的原因，" +
                                                "设置好的提醒可能" +
                                                "被其他脚本冲掉。\n\n" +
                                                "如果发生这种情况，" +
                                                "运行一次本脚本即可" +
                                                "恢复通知\n\n",
                                            });

                                            $cache.set("user_data", {
                                                "rixcloud_user_name": user_data.rixcloud_user_name,
                                                "rixcloud_account_password": user_data.rixcloud_account_password,
                                                "rixcloud_service_id": user_data.rixcloud_service_id,
                                                "rixcloud_service_name": user_data.rixcloud_service_name,
                                                "everyday_trigger_boolean": everyday_trigger_boolean,
                                                "everyday_trigger_time": everyday_trigger_time
                                            });
                                            trigger_persistent();
                                            get_service_data();
                                        }
                                    }
                                }
                            ]
                        }
                    )
                } else if (idx === 1) {
                    cancel_trigger();
                    everyday_trigger_boolean = false;
                    everyday_trigger_time = null;
                    $cache.set("user_data", {
                        "rixcloud_user_name": user_data.rixcloud_user_name,
                        "rixcloud_account_password": user_data.rixcloud_account_password,
                        "rixcloud_service_id": user_data.rixcloud_service_id,
                        "rixcloud_service_name": user_data.rixcloud_service_name,
                        "everyday_trigger_boolean": everyday_trigger_boolean,
                        "everyday_trigger_time": everyday_trigger_time
                    });
                    trigger_persistent();
                    get_service_data();
                }
            }
        })
    } else {
        rixcloud_user_name = user_data.rixcloud_user_name;
        rixcloud_account_password = user_data.rixcloud_account_password;
        rixcloud_service_id = user_data.rixcloud_service_id;
        rixcloud_service_name = user_data.rixcloud_service_name;
        everyday_trigger_boolean = user_data.everyday_trigger_boolean;
        everyday_trigger_time = user_data.everyday_trigger_time;
        trigger_persistent();
        get_service_data();
    }
}

function main() {
    loading_view();
    get_user_data();
}

main();

