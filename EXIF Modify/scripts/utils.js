function sayHello() {
    $ui.alert($l10n('HELLO_WORLD'));
}

function tapticTaptic(repeat_times) {
    for (let i = 0; i <= repeat_times; i++) {
        $delay(0.3 * i, function () {
            $device.taptic(2);
        })
    }
}


function stopScript() {
    tapticTaptic(3);
    $ui.clearToast();
    $device.taptic(2);
    $context.close();
    $app.close();
}

module.exports = {
    sayHello: sayHello,
    tapticTaptic: tapticTaptic,
    stopScript: stopScript,
};