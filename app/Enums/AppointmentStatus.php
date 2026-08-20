<?php

namespace App\Enums;

enum AppointmentStatus: string
{
    case Draft = 'draft';
    case Pending = 'pending';
    case NeedsReview = 'needs_review';
    case CounsellorReviewing = 'counsellor_reviewing';
    case Approved = 'approved';
    case OnGoing = 'on_going';
    case Complete = 'complete';
    case Completed = 'completed';
    case FollowUp = 'follow_up';
    case Closed = 'closed';
}
