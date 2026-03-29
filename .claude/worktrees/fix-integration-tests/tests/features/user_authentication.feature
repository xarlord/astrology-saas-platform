Feature: User Authentication
  As a user of the astrological platform
  I want to authenticate myself
  So that I can securely access my charts and features

  Background:
    Given the application is running
    And the authentication service is available
    And the database is connected

  Scenario: Successful user registration with valid data
    Given I am on the registration page
    When I enter a valid email "test@example.com"
    And I enter a valid password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I enter my name "John Doe"
    And I accept the terms and conditions
    And I click the "Register" button
    Then I should see a success message "Registration successful"
    And my account should be created
    And I should be redirected to the dashboard
    And a confirmation email should be sent

  Scenario: Failed registration with existing email
    Given I am on the registration page
    And a user with email "existing@example.com" already exists
    When I enter the email "existing@example.com"
    And I enter a valid password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I enter my name "Jane Doe"
    And I click the "Register" button
    Then I should see an error message "Email already registered"
    And my account should not be created
    And I should remain on the registration page

  Scenario: Failed registration with password mismatch
    Given I am on the registration page
    When I enter a valid email "test@example.com"
    And I enter a valid password "SecurePass123!"
    And I confirm the password "DifferentPass123!"
    And I enter my name "John Doe"
    And I click the "Register" button
    Then I should see an error message "Passwords do not match"
    And my account should not be created

  Scenario: Failed registration with weak password
    Given I am on the registration page
    When I enter a valid email "test@example.com"
    And I enter a weak password "123"
    And I confirm the password "123"
    And I enter my name "John Doe"
    And I click the "Register" button
    Then I should see an error message "Password must be at least 8 characters"
    And my account should not be created

  Scenario Outline: Registration validation with various email formats
    Given I am on the registration page
    When I enter the email "<email>"
    And I enter a valid password "SecurePass123!"
    And I confirm the password "SecurePass123!"
    And I enter my name "John Doe"
    And I click the "Register" button
    Then I should see the validation message "<message>"

    Examples:
      | email                | message                           |
      | invalid              | Invalid email format              |
      | @example.com         | Invalid email format              |
      | test@                | Invalid email format              |
      | test..test@example.com | Invalid email format            |
      | .test@example.com    | Invalid email format              |

  Scenario: Successful login with valid credentials
    Given I am registered with email "test@example.com" and password "SecurePass123!"
    And I am on the login page
    When I enter my email "test@example.com"
    And I enter my password "SecurePass123!"
    And I click the "Login" button
    Then I should be redirected to the dashboard
    And I should see a welcome message "Welcome back!"
    And my session should be authenticated

  Scenario: Failed login with invalid email
    Given I am on the login page
    When I enter an unregistered email "nonexistent@example.com"
    And I enter a password "SecurePass123!"
    And I click the "Login" button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
    And my session should not be authenticated

  Scenario: Failed login with invalid password
    Given I am registered with email "test@example.com" and password "SecurePass123!"
    And I am on the login page
    When I enter my email "test@example.com"
    And I enter an incorrect password "WrongPassword123!"
    And I click the "Login" button
    Then I should see an error message "Invalid credentials"
    And I should remain on the login page
    And my session should not be authenticated

  Scenario: Successful logout
    Given I am logged in as "test@example.com"
    And I am on the dashboard
    When I click the "Logout" button
    Then I should be redirected to the login page
    And my session should be cleared
    And I should see a message "You have been logged out"

  Scenario: Logout and redirect to protected page
    Given I am logged in as "test@example.com"
    And I have accessed a protected page "/charts"
    When I click the "Logout" button
    And I try to access "/charts"
    Then I should be redirected to the login page
    And I should see a message "Please login to continue"

  Scenario: Session timeout after inactivity
    Given I am logged in as "test@example.com"
    And the session timeout is set to 30 minutes
    And I am inactive for 31 minutes
    When I try to access any protected page
    Then I should be redirected to the login page
    And I should see a message "Your session has expired"

  Scenario: Remember me functionality
    Given I am on the login page
    When I enter my email "test@example.com"
    And I enter my password "SecurePass123!"
    And I check the "Remember me" checkbox
    And I click the "Login" button
    Then a remember me token should be stored
    And I should remain logged in after closing the browser
