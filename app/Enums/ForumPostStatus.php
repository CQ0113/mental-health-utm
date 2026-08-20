<?php

namespace App\Enums;

enum ForumPostStatus: string
{
    case PendingReview = 'pending_review';
    case Published = 'published';
    case Hidden = 'hidden';
    case Deleted = 'deleted';
}
