package com.matchflix.backend.reco;

import com.matchflix.backend.dto.MovieDto;
import com.matchflix.backend.ml.MochinefClient;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reco")
@CrossOrigin(origins = "http://localhost:3000")
public class RecoController {

    private final RecoService svc;

    public RecoController(RecoService svc) {
        this.svc = svc;
    }

    // /api/reco/search?q=Inception
    @GetMapping("/search")
    public List<MochinefClient.MovieSearchResult> search(@RequestParam("q") String q) {
        return svc.searchByTitle(q);
    }

    // /api/reco/personal?userId=1&limit=20
    @GetMapping("/personal")
    public List<MovieDto> personal(@RequestParam Long userId,
                                   @RequestParam(defaultValue = "20") int limit) {
        return svc.personal(userId, limit);
    }

    // /api/reco/match?userA=1&userB=2&limit=30
    @GetMapping("/match")
    public List<MovieDto> match(@RequestParam Long userA,
                                @RequestParam Long userB,
                                @RequestParam(defaultValue = "30") int limit) {
        return svc.match(userA, userB, limit);
    }
}
