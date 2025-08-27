package com.matchflix.backend.reco;

import com.matchflix.backend.dto.HomeFeedDto;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reco")
@CrossOrigin(origins = "http://localhost:3000")
public class HomeFeedController {

    private final HomeFeedService home;

    public HomeFeedController(HomeFeedService home) {
        this.home = home;
    }

    @GetMapping("/home")
    public HomeFeedDto home(@RequestParam(required = false) Long userId,
                            @RequestParam(defaultValue = "20") int perSection) {
        return home.buildHome(userId, perSection);
    }
}
