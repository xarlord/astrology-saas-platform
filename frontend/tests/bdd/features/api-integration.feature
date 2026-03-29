@api @integration @production
Feature: API Integration Tests
  As a system
  I want to verify API integrations work correctly
  So that the application functions reliably in production

  Background:
    Given the application is running
    And the database is connected

  # Health Checks
  @health @smoke
  Scenario: API health check
    When I request GET "/api/health"
    Then the response status should be 200
    And the response should contain:
      | Field     |
      | status    |
      | timestamp |
      | version   |

  @health @database
  Scenario: Database connection health
    When I request GET "/api/health/database"
    Then the response status should be 200
    And the response should contain "connected"

  # Authentication API
  @api @auth
  Scenario: User registration via API
    Given I have valid registration data
    When I request POST "/api/v1/auth/register" with:
      | Field     | Value                   |
      | email     | newuser@example.com     |
      | password  | SecurePassword123!      |
      | name      | New User                |
    Then the response status should be 201
    And the response should contain "token"
    And the response should contain "user"

  @api @auth
  Scenario: User login via API
    Given a user exists with email "test@example.com"
    When I request POST "/api/v1/auth/login" with:
      | Field    | Value              |
      | email    | test@example.com   |
      | password | TestPassword123!   |
    Then the response status should be 200
    And the response should contain "token"

  @api @auth
  Scenario: Invalid login returns 401
    When I request POST "/api/v1/auth/login" with:
      | Field    | Value              |
      | email    | wrong@example.com  |
      | password | WrongPassword      |
    Then the response status should be 401
    And the response should contain "error"

  @api @auth
  Scenario: Protected endpoint requires authentication
    When I request GET "/api/v1/users/me" without token
    Then the response status should be 401

  # Charts API
  @api @charts
  Scenario: Create chart via API
    Given I am authenticated
    When I request POST "/api/v1/charts" with:
      | Field        | Value              |
      | name         | Test Chart         |
      | birthDate    | 1990-06-15         |
      | birthTime    | 14:30              |
      | latitude     | 40.7128            |
      | longitude    | -74.0060           |
    Then the response status should be 201
    And the response should contain chart data

  @api @charts
  Scenario: Get user charts via API
    Given I am authenticated
    And I have 3 saved charts
    When I request GET "/api/v1/charts"
    Then the response status should be 200
    And the response should contain 3 charts

  @api @charts
  Scenario: Get single chart via API
    Given I am authenticated
    And I have a chart with ID "chart-123"
    When I request GET "/api/v1/charts/chart-123"
    Then the response status should be 200
    And the response should contain chart data

  @api @charts
  Scenario: Update chart via API
    Given I am authenticated
    And I have a chart with ID "chart-123"
    When I request PUT "/api/v1/charts/chart-123" with:
      | Field | Value           |
      | name  | Updated Name    |
    Then the response status should be 200
    And the chart name should be "Updated Name"

  @api @charts
  Scenario: Delete chart via API
    Given I am authenticated
    And I have a chart with ID "chart-123"
    When I request DELETE "/api/v1/charts/chart-123"
    Then the response status should be 204

  # Synastry API
  @api @synastry
  Scenario: Generate synastry report via API
    Given I am authenticated
    And I have charts with IDs "chart-1" and "chart-2"
    When I request POST "/api/v1/synastry" with:
      | Field     | Value     |
      | chart1Id  | chart-1   |
      | chart2Id  | chart-2   |
    Then the response status should be 200
    And the response should contain:
      | Field               |
      | compatibilityScore  |
      | aspects             |
      | interpretations     |

  # Transits API
  @api @transits
  Scenario: Get current transits via API
    Given I am authenticated
    And I have a chart with ID "chart-1"
    When I request GET "/api/v1/transits?chartId=chart-1"
    Then the response status should be 200
    And the response should contain transit data

  @api @transits
  Scenario: Get transit forecast via API
    Given I am authenticated
    And I have a chart with ID "chart-1"
    When I request GET "/api/v1/transits/forecast?chartId=chart-1&months=6"
    Then the response status should be 200
    And the response should contain forecast data

  # Error Handling
  @api @errors
  Scenario: 404 for non-existent resource
    Given I am authenticated
    When I request GET "/api/v1/charts/non-existent-id"
    Then the response status should be 404

  @api @errors
  Scenario: 400 for invalid request data
    Given I am authenticated
    When I request POST "/api/v1/charts" with:
      | Field | Value |
      | name  |       |
    Then the response status should be 400
    And the response should contain validation errors

  @api @errors
  Scenario: 429 for rate limiting
    Given I have exceeded the rate limit
    When I request GET "/api/v1/charts"
    Then the response status should be 429
    And the response should contain "Retry-After" header

  # Performance
  @api @performance
  Scenario: API response time under load
    When I send 100 concurrent requests to "/api/v1/charts"
    Then all responses should arrive within 2000ms
    And no responses should have status 5xx

  @api @performance
  Scenario: Pagination works correctly
    Given I am authenticated
    And I have 50 charts
    When I request GET "/api/v1/charts?page=1&limit=10"
    Then the response status should be 200
    And the response should contain 10 charts
    And the response should contain pagination metadata

  # Data Validation
  @api @validation
  Scenario Outline: Invalid chart data is rejected
    Given I am authenticated
    When I request POST "/api/v1/charts" with:
      | Field      | Value        |
      | name       | <name>       |
      | birthDate  | <birthDate>  |
    Then the response status should be 400

    Examples:
      | name    | birthDate   |
      |         | 1990-01-01  |
      | Test    | invalid     |
      | Test    | 2050-01-01  |

  # CORS and Security
  @api @security
  Scenario: CORS headers are present
    When I request OPTIONS "/api/v1/charts"
    Then the response should contain header "Access-Control-Allow-Origin"
    And the response should contain header "Access-Control-Allow-Methods"

  @api @security
  Scenario: SQL injection is prevented
    Given I am authenticated
    When I request GET "/api/v1/charts?name='; DROP TABLE charts; --"
    Then the response status should be 400
    And the database should remain intact

  @api @security
  Scenario: XSS is prevented
    Given I am authenticated
    When I request POST "/api/v1/charts" with:
      | Field | Value                              |
      | name  | <script>alert('xss')</script>      |
    Then the response should sanitize the input

  # Database Transactions
  @api @database
  Scenario: Failed request rolls back transaction
    Given I am authenticated
    And I have 3 charts
    When I attempt to create a chart with invalid data
    Then no new chart should be created
    And I should still have 3 charts

  @api @database
  Scenario: Concurrent updates are handled correctly
    Given I am authenticated
    And I have a chart with ID "chart-1"
    When two users update the same chart simultaneously
    Then only one update should succeed
    And the other should receive a conflict error
