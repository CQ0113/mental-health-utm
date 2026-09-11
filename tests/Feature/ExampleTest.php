<?php

test('root redirects toward the client portal, which requires login', function () {
    $this->get(route('home'))->assertRedirect('/psycare');

    $this->get('/psycare')->assertRedirect('/psycare/dashboard');

    $this->get('/psycare/dashboard')->assertRedirect('/login');
});
