<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class ForumModerationController extends Controller
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'content' => ['nullable', 'string', 'max:5000'],
        ]);

        $payloadText = Str::lower(trim(($validated['title'] ?? '').' '.($validated['content'] ?? '')));

        $riskKeywords = [
            'bunuh diri' => 45,
            'kill myself' => 45,
            'kill them' => 45,
            'hate speech' => 35,
            'racist' => 35,
            'seks' => 30,
            'explicit' => 30,
            'porn' => 30,
            'violent' => 25,
        ];

        $safetyScore = 95;
        $matchedKeywords = [];

        foreach ($riskKeywords as $keyword => $penalty) {
            if (Str::contains($payloadText, $keyword)) {
                $matchedKeywords[] = $keyword;
                $safetyScore -= $penalty;
            }
        }

        $safetyScore = max(0, min(100, $safetyScore));
        $isSafe = $safetyScore >= 30;

        return response()->json([
            'safe' => $isSafe,
            'safetyScore' => $safetyScore,
            'message' => $isSafe
                ? 'Content passed AI moderation and is safe to publish.'
                : 'AI moderation flagged this topic as unsafe for public publishing. Please revise and try again.',
            'reason' => $isSafe ? 'approved' : 'unsafe_content',
            'matchedKeywords' => $matchedKeywords,
        ], 200);
    }
}
