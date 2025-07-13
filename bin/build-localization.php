<?php
/** @Jackplay 2025 - 7D2D Planner**/
$localization_file = __DIR__ . '/../datas/Localization.txt';

$row = 1;
$done = 0;

$keyIndex = 0;
$fileIndex = 1;
$typeIndex = 2;
$langs = [
    "en" => 5,
    "de" => 7,
    "es" => 8,
    "fr" => 9,
    "it" => 10,
    "ja" => 11,
    "kr" => 12,
    "pl" => 13,
    "br" => 14,
    "ru" => 15,
    "tr" => 16,
    "cn" => 17,
];

$keepFile = ['progression'];

$output = [];
foreach ($langs as $key => $value) {
    $output[$key] = [];
}

if (($handle = fopen($localization_file, "r")) !== FALSE) {
    while (($data = fgetcsv($handle, 10000, ",")) !== FALSE) {
        if(count($data)<6){
            continue;
        }

        $key = $data[$keyIndex];
        $file = $data[$fileIndex];
        $type = $data[$typeIndex];
        // CURRENTLY NOT USED
        if( $data[5] == "CURRENTLY NOT USED" ){
            continue;
        }

        if( !in_array($file, $keepFile) ){
            continue;
        }

        $num = count($data);
        echo "------------------------- $file / $type\n";
        foreach ($langs as $lang => $langKey) {
            echo "$lang > $key : " . $data[$langKey] . "\n";
            $output[$lang][$key] = $data[$langKey];
        }

    }

    fclose($handle);
}

foreach ($output as $lang=>$data) {
    file_put_contents(__DIR__.'/../public/i18n/localization_'.$lang.'.json', json_encode($data));
}