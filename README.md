=============
=Ironwood-js=
=============

A rot.js implementation of Peter Harkins' 2014 7 day roguelike entry, Ironwood (http://push.cx/2014/ironwood-a-roguelike-game-in-7-days). 

------
-Why?-
------

I wanted to participate in this year's 7DRL competition to get back into more programming, yet life conspired against me. So I ended up just watching the other entry updates on Twitter and blogs and playing at Ruby to learn more. In particular, Ironwood is a game I've heard design details about for a while. My intention was to see what transpired from this competition, learn what pitfalls to avoid, and do my own Ruby 7DRL in April. 

What I learned from Ironwood was that in 2014, we should not be trying to make a terminal-based game. I had a nightmare trying to get the right version of Ruby to play nicely with NCurses/Dispel and even after that found out that my terminal wasn't happy with the colors Ironwood was using. In short, it took more time to fail at getting Ruby to play nicely than it did to play test.

--------
-Rot.js-
--------

While viewing the entries for this year's 7DRL, I stumbled on Goldfish (http://ondras.github.io/goldfish/) by Ondřej Žára. It's a fun RL based on a fake terminal using his Javascript toolkit rot.js. It looks good and far more people have a compatible browser than do the right version of Ruby and whatever gems I might use to make a RL in a terminal. 

I decided to learn from Peter's efforts and not ever develop a RL in an actual terminal, but use rot.js instead. It's 2014, everyone's got an appropriate browser, very very few have an appropriate terminal or the right environment.

So to brush up on my very poor Javascript, I decided it'd be fun to port Ironwood to Javascript, using rot.js, and see if more people could enjoy the game Peter designed.

---------
-Credits-
---------

Ironwood was developed by Peter Harkins and I've ported it with his permission.
  -http://push.cx/2014/ironwood-a-roguelike-game-in-7-days
  -https://github.com/pushcx/ironwood

Rot.js was developed by Ondřej Žára and I'm using it under the BSD license.
  -http://ondras.github.io/rot.js/hp/
  -https://github.com/ondras/rot.js
