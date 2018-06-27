// By JunM。
// Please refer to Readme.md

// let app = require("scripts/app");
let piexif = require("scripts/piexif");
let utils = require("scripts/utils");
let exifObj_original = null; // Store exif data of original photo.
let image_data = null;
let image_data_base64 = null;


let user_data = {
    api_key: null
}; // TinyJPG api key.
let api_key = null;


// let in_jpg = $file.read("/assets/in.jpg");
// console.log(in_jpg);

// app.sayHello();

// let imageData = in_jpg;
// console.log(typeof imageData);
// console.log(imageData);
//
// imageData = "data:image/jpg;base64," + $text.base64Encode(imageData);
// console.log(imageData);


// exifObj_original = piexif.load(imageData);
// console.log(exifObj_original);
// console.log(exifObj_original["0th"]);
// console.log($text.base64Decode(imageData.substring(22,)));


// $app.close();


function stopToast() {
    $ui.toast("", 0.5);
}


function stopScript() {
    utils.tapticTaptic(3);
    stopToast();
    $context.close();
    $app.close();
}


// Tell whether TinyJPG key exists
function query_tiny_jpg_key() {
    let p = new Promise(function (resolve, reject) {


        user_data = $cache.get("user_data");
        if (user_data === undefined || user_data.api_key === null || user_data.api_key === undefined) {
            // let user input key

            $ui.alert({
                title: "没有检测到 KEY",
                message: "脚本调用 TinyJPG 的 API 进行图片压缩，KEY 是免费获取的，\n一个 KEY 每个月可以压缩 500 张照片，\n" +
                "每月重置使用量，\n如果有更多需求，可以考虑注册多个 KEY。\n\n\n1、填写名字（随意填写）、自己的邮箱即可\n" +
                "2、通过邮箱收到的链接查看自己的 KEY",
                actions: [
                    {
                        title: "我已经有 Key 了",
                        handler: function () {
                            // let user input key.
                            $input.text({
                                placeholder: `请输入 TinyJPG 的 KEY`,
                                handler: function (text) {
                                    api_key = text;
                                    $cache.set("user_data", {
                                        "api_key": api_key,
                                    });
                                    resolve("Whatever");
                                }
                            });
                        }
                    },
                    {
                        title: "跳转到 TinyJPG 网站 KEY 获取页面",
                        handler: function () {
                            // Jump to TinyJPG Page.
                            $delay(1, function () {
                                $app.openURL("https://tinyjpg.com/developers");
                                stopScript();
                            });

                        }
                    },
                    {
                        title: "取消",
                        handler: function () {
                            stopScript();
                        }
                    }
                ]
            });


        } else {
            api_key = user_data.api_key;
            resolve("Whatever");
        }
    });
    return p;
}


// Upload photo to TinyJPG to compress
// Save compressed photo (with exif)
function compress_photo(original_photo_data) {
    return new Promise(function (resolve, reject) {
        $ui.toast("正在上传图片至 TinyPNG……", 60);
        $http.request({
            method: "POST",
            url: "https://api.tinify.com/shrink",
            header: {
                Authorization: "Basic " + $text.base64Encode("api:" + api_key),
            },
            body: original_photo_data,

            handler: function (resp) {

                let response = resp.response;

                if (response.statusCode === 201 || response.statusCode === 200) {
                    $ui.toast("正在压缩……", 30);
                    let compressedImageUrl = response.headers["Location"];
                    $ui.toast("正在下载压缩后的图片……", 60);
                    $http.download({
                        url: compressedImageUrl,
                        handler: function (resp_) {
                            if (resp_.data) {
                                image_data = resp_.data;
                                $photo.save({
                                    data: generate_new_photo_with_original_exif(image_data),
                                    handler: function (result) {
                                        if (result === true) {
                                            $ui.toast("压缩完成", 1);
                                            let successMessage = "本 KEY 本月已用：" + response.headers["compression-count"] + " / 500";
                                            $ui.toast(successMessage, 5);
                                            utils.tapticTaptic(9);
                                            $delay(3, function () {
                                                stopScript();
                                            });
                                            resolve("Whatever");
                                        } else {
                                            $ui.alert({
                                                title: "Error",
                                                message: result
                                            });
                                            stopScript();
                                        }
                                    }
                                })
                            }
                        }
                    })
                } else if (response.statusCode === 401) {

                    $ui.alert({
                        title: "验证失败",
                        message: "请确认 API KEY 填写正确，如果有误，可以清除本脚本的缓存，重新输入。\n\n当前填写的 KEY 为：\n\n"
                        + api_key,
                        actions: [
                            {
                                title: "清除已存储的 KEY",
                                handler: function () {
                                    $cache.clear();
                                    stopScript();
                                }
                            },
                            {
                                title: "取消",
                                handler: function () {
                                    stopScript();
                                }
                            }
                        ]
                    });
                    stopScript();
                } else {
                    $ui.alert({
                        title: "压缩失败",
                        message: response,
                        actions: [
                            {
                                title: "清除已存储的 KEY",
                                handler: function () {
                                    $cache.clear();
                                    stopScript();
                                }
                            },
                            {
                                title: "取消",
                                handler: function () {
                                    stopScript();
                                }
                            }
                        ]

                    });
                    stopScript();
                }
            }
        });
    });
}



function store_original_exif(original_photo_data) {

    return new Promise(function (resolve, reject) {
        image_data_base64 = "data:image/jpg;base64," + $text.base64Encode(original_photo_data);
        console.log("image_data_base64:");
        console.log(image_data_base64);

        exifObj_original = piexif.load(image_data_base64);
        console.log("exifObj_original[\"0th\"]:");
        console.log(exifObj_original["0th"]);
        resolve("Whatever");
    });
}


function generate_new_photo_with_original_exif(compressed_photo_data_without_exif) {
    exifObj_original["0th"][piexif.ImageIFD.Orientation] = 0;
    let exifbytes = piexif.dump(exifObj_original);
    image_data_base64 = "data:image/jpg;base64," + $text.base64Encode(compressed_photo_data_without_exif);
    let new_photo_base64 = piexif.insert(exifbytes, image_data_base64);
    return $data({
        url: new_photo_base64
    })
}


// TODO 
if (($app.env !== $env.app) && ($app.env !== $env.action)) {
    $ui.alert({
        title: "请在分享菜单 和 JSBox APP 中运行本脚本",
        message: "",
    });
    stopScript();
} else if ($app.env === $env.action) {
    // TODO 还没写

    if ($context.data) {
        image_data = $context.data;
        query_tiny_jpg_key().then(function () {
            store_original_exif(image_data).then(function () {
                compress_photo(image_data);
            });
        })
    } else {
        stopScript();
    }
} else if ($app.env === $env.app) {
    query_tiny_jpg_key().then(function () {
        $photo.pick({
            multi: false,
            format: "data",
            handler: function (resp) {
                image_data = resp.data;
                store_original_exif(image_data).then(function () {
                    compress_photo(image_data);

                });
            }
        })
    });
} else {
    $ui.alert("请在 JSBox 主应用中 或 通过分享菜单运行本脚本");
    stopScript();
}
