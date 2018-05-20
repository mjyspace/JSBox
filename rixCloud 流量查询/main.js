// By JunM
// 2018-05-20
// $cache.clear();

$app.validEnv = $env.today | $env.app;
if ($app.env !== $env.today && $app.env !== $env.app) {
    $ui.alert("请在 Widget 和 APP 内运行");
    $app.close();
}

let canvas_height = 800;
let canvas_width = 860;
if ($app.env === $env.today) {
    canvas_height = 460;
    canvas_width = 1700;
}

let rixcloud_user_name = "";
let rixcloud_account_password = "";
let rixcloud_service_id = "";
let rixcloud_service_name = "";
let html_template = $file.read("/assets/html/template.html").string;
let user_data = $cache.get("user_data");

let color_of_download = "#d78965";
let color_of_upload = "#F6C555";
let color_of_available = "#7BA23F";


function error_handler(status_code) {
    if (status_code === 401) {
        $ui.alert({
            title: "鉴权失败",
            message: "您输入的用户名为：\n" + rixcloud_user_name + "\n您输入的密码为：\n"
            + rixcloud_account_password
            + "\n\n如果输入有误，请清除脚本缓存重新运行；如果无误，请确认您的账号可以正常访问；此外，已发现有的密码会影响访问 rixCloud " +
            "API，可以尝试临时修改登陆密码为简单密码，看看是否可以正常运行。",
        })
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
        url: "https://api.rixcloud.io/v1/profile/service/" + rixcloud_service_id + "/traffic",
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

            $app.close(10);
        }
    });
}


function get_user_data() {
    if (user_data === undefined) {

        $input.text({
            placeholder: "请输入 rixCloud 用户名",
            handler: function (text) {
                rixcloud_user_name = text;
                $input.text({
                    placeholder: "请输入 rixCloud 登陆密码",
                    handler: function (text) {
                        rixcloud_account_password = text;
                        $http.request({
                            method: "GET",
                            url: "https://api.rixcloud.io/v1/profile/service",
                            header: {
                                "Authorization": "Basic " + $text.base64Encode(rixcloud_user_name + ":" + rixcloud_account_password)
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
                                            $cache.set("user_data", {
                                                "rixcloud_user_name": rixcloud_user_name,
                                                "rixcloud_account_password": rixcloud_account_password,
                                                "rixcloud_service_id": rixcloud_service_id,
                                                "rixcloud_service_name": rixcloud_service_name
                                            });
                                            get_service_data();
                                        }
                                    });


                                }
                            }
                        });
                    }
                });
            }

        });

    } else {
        rixcloud_user_name = user_data.rixcloud_user_name;
        rixcloud_account_password = user_data.rixcloud_account_password;
        rixcloud_service_id = user_data.rixcloud_service_id;
        rixcloud_service_name = user_data.rixcloud_service_name;
        get_service_data();
    }


}

function main() {
    get_user_data();
}

main();

