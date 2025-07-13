<?php
/** @Jackplay 2025 - 7D2D Planner**/

// ---------------------------------------------------- START
// Goal, extract datas for make JSON used in app

// Source (Game file)
$progression_file = __DIR__ . '/../datas/progression.xml';

// XML, year, il like loops
$xml = simplexml_load_string(file_get_contents($progression_file));

// Store shit here
$attributes = [];
$general = [];
$books = [];
$crafting = [];



// ---------------------------------------------------- ATTRIBUTES ROOT
foreach($xml->attributes->attribute as $attribute){

    $attributeName = (string)$attribute['name'];
    $attributeNameKey = (string)$attribute['name_key'];
    $attributeDeskKey = (string)$attribute['desc_key'];
    $attributeIcon = (string)$attribute['icon'];

    switch($attributeName){
        case 'attPerception':
        case 'attStrength':
        case 'attFortitude':
        case 'attAgility':
        case 'attIntellect':
        case 'attGeneralPerks':
            // Basics datas
            $attributes[$attributeName] = [
                'label' => $attributeNameKey,
                'description' => $attributeDeskKey,
                'icon' => $attributeIcon,
                'level' => 1,
                'levels' => [],
                'perksGroups' => [

                ]
            ];

            // Cost ans level get int "level_requirments"
            foreach ($attribute->level_requirements as $effect){
                $level = (int)$effect['level'];
                $cost = (string)$effect->requirement['desc_key'];
                $costInt = intval(substr($cost,16, 2));
                $attributes[$attributeName]['levels'][$level] = [
                    'level' => $level,
                    'buy' => $level == 1,
                    'cost' => $level == 1 ? 0 : $costInt,
                ];
            }

            // Texts in "effect_group"
            foreach ($attribute->effect_group as $effectGroup){
                foreach ($effectGroup->effect_description as $effect){
                    $level = (int)$effect['level'];
                    $label = (string)$effect['desc_key'];
                    $description = (string)$effect['long_desc_key'];
                    $attributes[$attributeName]['levels'][$level]['label'] = $label;
                    $attributes[$attributeName]['levels'][$level]['description'] = $description;
                }
            }
            break;

        case 'attBooks':
            $books = [
                'label' => $attributeNameKey,
                'description' => $attributeDeskKey,
                'icon' => $attributeIcon,
                'level' => 1,
                "levels" => [
                    1 => [
                        "level" => 1,
                        "buy" => true,
                        "cost" => 0    
                    ]
                ],
                'perksGroups' => [
                    'general' => [
                        'label' => 'general',
                        'perks' => []
                    ]
                ]
            ];
            break;

        case 'attCrafting':
            $crafting = [
                'label' => $attributeNameKey,
                'description' => $attributeDeskKey,
                'icon' => $attributeIcon,
            ];
            break;

    }
}


// ---------------------------------------------------- ATTRIBUTES SKILL GROUPS
// Note : General perk haven't group, so create "fake" group
$attributes['attGeneralPerks']['perksGroups']['general'] = [
    'label' => 'general',
    'icon' => 'general',
    'description' => 'general',
    'perks' => [],
];

// Store relation GROUP <> PERK
$skillsParentRel = [];

// Skills (groups)
foreach($xml->skills->skill as $skill){
    $name = (string)$skill['name'];
    $parent = (string)$skill['parent'];
    if( $parent == "attGeneralPerks"){
        continue;
    }
    $skillsParentRel[$name] = $parent;
    $label = (string)$skill['name_key'];
    $icon = (string)$skill['icon'];
    $description = (string)$skill['desc_key'];
    $attributes[$parent]['perksGroups'][$name] = [
        'label' => $label,
        'icon' => $icon,
        'description' => $description,
        'perks' => []
    ];
}

// ---------------------------------------------------- PERKS
// Perks
foreach($xml->perks->perk as $perk){
    $perkDatas = [];
    $name = (string)$perk['name'];
    $parent = (string)$perk['parent'];
    $label = (string)$perk['name_key'];
    $icon = (string)$perk['icon'];
    $description = (string)$perk['desc_key'];
    $limit = 5;
    $specialCost = null;


    // For General fuck!ng perk
    $startLvl = 1; 
    if( $parent == 'skillGeneralPerks' ){
        $attribute = 'attGeneralPerks';
        $group = 'general';
        $costs = (string)$perk['override_cost'];
        $specialCost = explode(',', $costs);
        $limit = (int)$perk['max_level']?:5;
    } else {
        $attribute = $skillsParentRel[$parent];
        $group = $parent;
    }

    // Array with perk's levels
    $levels = [];

    foreach ($perk->level_requirements as $level){
        $lvl = (int)$level['level'];
        $requireLevel = (int)$level->requirement['value'];
        $requireText = (string)$level->requirement['desc_key'];
        $levels[$lvl] = [
            'level' => $lvl,
            'buy' => false,
            'cost' => 1,
            'requireAttributeLevel' => $requireLevel,
            'requireAttributeText' => $requireText,
        ];
    }

    // Get texts and usuals datas
    foreach ($perk->effect_group as $effect_group){
        foreach ($effect_group->effect_description as $effect_description) {
            if($limit == 0){
                // For General Perk with missing limit
                continue;
            }
            $level = (int)$effect_description['level'];
            $description = (string)$effect_description['long_desc_key'];
            $label = (string)$effect_description['desc_key'];
            $levels[$level]['label'] = $label;
            $levels[$level]['description'] = $description;
            if($group == 'general'){
                $levels[$level]['buy'] = false;
                $levels[$level]['cost'] = (int)$specialCost[$startLvl-1];
                $levels[$level]['level'] = $startLvl++;
                $limit--;
            }
        }
    }

    $perkDatas = [
        'name' => $name,
        'icon' => $icon,
        'label' => $label,
        'description' => $description,
        'level' => 0,
        'levels' => $levels,
    ];

    $attributes[$attribute]['perksGroups'][$group]['perks'][$name] = $perkDatas;
}

// ---------------------------------------------------- BOOKS

// Books (group)
foreach($xml->skills->book_group as $book){
    $name = (string)$book['name'];
    echo "process GROUP BOOK '$name'\n";
    $parent = (string)$book['parent'];
    $label = (string)$book['name_key'];
    $description = (string)$book['desc_key'];
    $icon = (string)$book['icon'];
    $books['perksGroups']['general']['perks'][$name] = [
        "name" => $name,
        "icon" => $icon,
        "label" =>$label,
        "description" => $description,
        "parent" => $parent,
        "level" => 1,
        "levels" => [

        ]
    ];
}

// Books (Volumes)
foreach($xml->perks->book as $book){
    $name = (string)$book['name'];
    $parent = (string)$book['parent'];
    $label = (string)$book['desc_key'];
    $$description = (string)$book['long_desc_key'];

    if( array_key_exists($parent, $books['perksGroups']['general']['perks']) ){
        $volume = count($books['perksGroups']['general']['perks'][$parent]['levels'])+1;
        $books['perksGroups']['general']['perks'][$parent]['levels'][] = [
            'level' => $volume,
            'name' => $name,
            'label' => "Vol. $volume",
            'description' => $label,
            "buy" => false,
            "buyable" => false,
            "cost" => 0,
        ];
    } else {
        echo "Warning, missing key '$parent' in attBook\n";
    }
}
$attributes['attBooks'] = $books;
file_put_contents(__DIR__ . '/../src/perks.json', json_encode($attributes, JSON_PRETTY_PRINT));


// Skills