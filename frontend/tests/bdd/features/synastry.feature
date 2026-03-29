@synastry @compatibility @core-feature
Feature: Synastry and Compatibility Analysis
  As a user
  I want to compare two natal charts for compatibility
  So that I can understand relationship dynamics

  Background:
    Given I am logged in
    And I have at least 2 saved charts

  # Synastry Chart Generation
  @synastry @smoke
  Scenario: Generate basic synastry report
    Given I have charts named "Person A" and "Person B"
    When I navigate to synastry comparison
    And I select "Person A" as the first chart
    And I select "Person B" as the second chart
    And I generate the synastry report
    Then I should see the synastry chart
    And I should see the overall compatibility score
    And I should see aspects between the charts

  @synastry @scores
  Scenario: View detailed compatibility scores
    Given I have generated a synastry report
    Then I should see compatibility scores for:
      | Category          |
      | Overall           |
      | Communication     |
      | Emotional         |
      | Physical          |
      | Intellectual      |
      | Values            |
      | Long-term         |

  @synastry @aspects
  Scenario: View synastry aspects
    Given I have generated a synastry report
    Then the aspects should include:
      | Planet 1  | Aspect    | Planet 2  |
      | Sun       | Conjunct  | Moon      |
      | Venus     | Trine     | Mars      |
      | Mercury   | Sextile   | Mercury   |

  @synastry @interpretation
  Scenario: View aspect interpretations
    Given I have generated a synastry report
    When I view detailed aspect interpretations
    Then I should see strengths in the relationship
    And I should see challenges in the relationship
    And each aspect should have a detailed interpretation

  # Composite Chart
  @composite @advanced
  Scenario: Generate composite chart
    Given I have charts named "Person A" and "Person B"
    When I navigate to synastry comparison
    And I select both charts
    And I generate a composite chart
    Then I should see the composite chart
    And I should see composite planetary positions
    And I should see relationship themes

  # Davison Chart
  @davison @advanced
  Scenario: Generate Davison relationship chart
    Given I have charts named "Person A" and "Person B"
    When I navigate to synastry comparison
    And I select both charts
    And I generate a Davison relationship chart
    Then I should see the Davison chart
    And I should see the relationship midpoint
    And I should see Davison interpretations

  # Synastry Export
  @synastry @export
  Scenario: Export synastry report
    Given I have generated a synastry report
    When I export the synastry report
    Then the synastry report should be downloaded
    And the report should include:
      | Content              |
      | Both charts          |
      | Aspect grid          |
      | Compatibility scores |
      | Interpretations      |

  # Synastry Sharing
  @synastry @share
  Scenario: Share synastry report
    Given I have generated a synastry report
    When I click "Share Report"
    And I enter email "partner@example.com"
    And I click "Send"
    Then I should see "Report shared successfully"
    And the recipient should receive an email

  # Chart Selection Validation
  @synastry @validation
  Scenario: Cannot compare same chart
    Given I have a chart named "My Chart"
    When I navigate to synastry comparison
    And I select "My Chart" as the first chart
    And I select "My Chart" as the second chart
    Then I should see an error "Please select different charts"

  @synastry @validation
  Scenario: Must select both charts
    Given I navigate to synastry comparison
    When I select only the first chart
    And I click "Generate"
    Then I should see an error "Please select both charts"

  # Premium Features
  @synastry @premium
  Scenario: Free user limited synastry
    Given I am a free user
    And I have generated 3 synastry reports this month
    When I try to generate another report
    Then I should see "Monthly limit reached"
    And I should be prompted to upgrade

  @synastry @premium
  Scenario: Premium user unlimited synastry
    Given I am a premium user
    When I generate 20 synastry reports
    Then all reports should be generated successfully

  # Relationship Types
  @synastry @relationship-types
  Scenario Outline: Compare different relationship types
    Given I have charts for "<relationship_type>"
    When I generate a synastry report for "<relationship_type>"
    Then I should see interpretations specific to "<relationship_type>"

    Examples:
      | relationship_type |
      | Romantic          |
      | Friendship        |
      | Business          |
      | Family            |

  # Accessibility
  @synastry @accessibility
  Scenario: Synastry screen reader accessibility
    Given I am using a screen reader
    And I have generated a synastry report
    Then I should hear compatibility scores
    And I should hear key aspects announced
    And I should be able to navigate interpretations

  # Mobile
  @synastry @mobile
  Scenario: Synastry on mobile device
    Given I am using a mobile device
    And I have generated a synastry report
    Then the synastry chart should be scrollable
    And scores should be visible
    And I should be able to swipe between sections
