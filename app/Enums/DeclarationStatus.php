<?php

namespace App\Enums;

enum DeclarationStatus: string
{
    case Draft = 'draft';
    case Submitted = 'submitted';
    case PendingVerification = 'pending_verification';
    case Verified = 'verified';
    case CorrectionRequired = 'correction_required';
    case Rejected = 'rejected';
}
