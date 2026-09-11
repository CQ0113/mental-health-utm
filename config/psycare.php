<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Terms and Conditions (DC — blocking first-use pop-up)
    |--------------------------------------------------------------------------
    |
    | Acceptance is recorded per client per version in `terms_acceptances`.
    | Bump the version when the wording materially changes — every client is
    | then asked to accept again, and the old acceptance stays on record as
    | proof of what they agreed to at the time.
    |
    */

    'terms' => [
        'version' => env('PSYCARE_TERMS_VERSION', '2026-01-01'),
    ],

    /*
    |--------------------------------------------------------------------------
    | Client Information Declaration (DC01/DC02 — Pengesahan tab)
    |--------------------------------------------------------------------------
    |
    | The exact wording the client agrees to is copied onto each declaration
    | row (`declarations.declaration_text`) at submission time, so changing
    | this text later never rewrites what past clients actually agreed to.
    |
    */

    'declaration' => [
        'text' => '** Saya mengaku bahawa segala maklumat yang diberikan di atas adalah BENAR dan TANPA SEBARANG UNSUR PAKSAAN DAN TEKANAN. / I declare that all information provided above is TRUE and WITHOUT ANY FORM OF COERCION OR PRESSURE.',
    ],

];
