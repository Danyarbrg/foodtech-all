package com.example.demo;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

  private final AuthenticationService service;

  @PostMapping("/login")
  public ResponseEntity<AuthenticationResponse> authenticate(
    @RequestBody @Valid AuthenticationRequest request
  ) {
    return ResponseEntity.ok(service.authenticate(request));
  }

  @PostMapping("/register")
  public ResponseEntity<AuthenticationResponse> register(
    @RequestBody @Valid RegisterRequest request
  ) {
    return ResponseEntity.ok(service.register(request));
  }
}
