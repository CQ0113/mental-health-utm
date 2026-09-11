<?php

namespace App\Enums;

enum ResourceType: string
{
    case Article = 'article';
    case Video = 'video';
    case Toolkit = 'toolkit';
}
